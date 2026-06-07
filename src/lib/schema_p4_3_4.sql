-- ============================================================================
-- CIRCLUP — P4 (Phases 3 & 4) : ANTI-FARM + BOOSTS SÉCURISÉS + COFFRE + PASS
-- ----------------------------------------------------------------------------
-- À exécuter après schema_p4_2.sql. Idempotent.
--   • Anti-farm : cooldown 3 min entre 2 actions identiques.
--   • Sécurise les boosts : is_boosted/boosted_until/top_until non modifiables
--     par le client (colmate la triche "boost gratuit").
--   • buy_boost (RPC) : boost payant, gratuit si Pass actif.
--   • Pass mensuel "Boost illimité" (800 CP / 30j).
--   • Coffre premium répétable (30 CP, espérance ~26 CP < coût → puits net).
-- ============================================================================

alter table profiles add column if not exists boost_pass_until timestamptz;

-- ─────────────────────────────────────────────────────────────
-- 1) Garde-fou colonnes "serveur" de posts (anti boost gratuit)
-- ─────────────────────────────────────────────────────────────
create or replace function _guard_post_update() returns trigger as $$
begin
  if current_user not in ('postgres', 'service_role', 'supabase_admin') then
    new.is_boosted     := old.is_boosted;
    new.boosted_until  := old.boosted_until;
    new.top_until      := old.top_until;
    new.support_budget := old.support_budget;
    new.likes_count    := old.likes_count;
    new.favorites_count:= old.favorites_count;
    new.shares_count   := old.shares_count;
    new.reviews_count  := old.reviews_count;
    new.buys_count     := old.buys_count;
    new.comments_count := old.comments_count;
    new.score          := old.score;
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_guard_post_update on posts;
create trigger trg_guard_post_update before update on posts
  for each row execute function _guard_post_update();

-- ─────────────────────────────────────────────────────────────
-- 2) Boost payant via RPC (gratuit si Pass actif)
-- ─────────────────────────────────────────────────────────────
create or replace function buy_boost(p_post_id uuid, p_hours integer)
returns text as $$
declare v_uid uuid := auth.uid(); v_owner uuid; v_cost integer; v_pass timestamptz;
begin
  if v_uid is null then return 'not_owner'; end if;
  select user_id into v_owner from posts where id = p_post_id;
  if v_owner is null or v_owner <> v_uid then return 'not_owner'; end if;
  v_cost := case when coalesce(p_hours,24) >= 48 then 200 else 100 end;
  select boost_pass_until into v_pass from profiles where id = v_uid;
  if v_pass is not null and v_pass > now() then v_cost := 0; end if;   -- Pass actif → offert
  if v_cost > 0 and not _spend_cp(v_uid, v_cost, 'Boost ' || coalesce(p_hours,24) || 'h') then
    return 'insufficient';
  end if;
  update posts
    set is_boosted = true,
        boosted_until = now() + (coalesce(p_hours,24) || ' hours')::interval
    where id = p_post_id;
  return 'ok';
end; $$ language plpgsql security definer;

-- ─────────────────────────────────────────────────────────────
-- 3) Pass mensuel "Boost illimité" (800 CP / 30 jours)
-- ─────────────────────────────────────────────────────────────
create or replace function buy_boost_pass()
returns boolean as $$
declare v_uid uuid := auth.uid(); v_cur timestamptz;
begin
  if v_uid is null then return false; end if;
  if not _spend_cp(v_uid, 800, 'Pass Boost illimité 30j') then return false; end if;
  select boost_pass_until into v_cur from profiles where id = v_uid;
  update profiles set boost_pass_until = greatest(coalesce(v_cur, now()), now()) + interval '30 days'
    where id = v_uid;
  return true;
end; $$ language plpgsql security definer;

-- ─────────────────────────────────────────────────────────────
-- 4) Coffre premium répétable (30 CP) — espérance < coût (puits net)
-- ─────────────────────────────────────────────────────────────
create or replace function open_premium_chest()
returns integer as $$
declare v_uid uuid := auth.uid(); v_r float; v_reward integer;
begin
  if v_uid is null then return -1; end if;
  if not _spend_cp(v_uid, 30, 'Coffre surprise premium') then return -1; end if;  -- -1 = CP insuffisants
  v_r := random();
  v_reward := case
    when v_r >= 0.99 then 500   -- 1%
    when v_r >= 0.95 then 100   -- 4%
    when v_r >= 0.80 then 40    -- 15%
    when v_r >= 0.50 then 20    -- 30%
    else 10                     -- 50%
  end;  -- EV ≈ 26 CP < 30 → l'économie reste saine, mais le jackpot fait rêver
  perform add_points(v_uid, v_reward, 0, 'Gain coffre surprise');
  return v_reward;
end; $$ language plpgsql security definer;

-- ─────────────────────────────────────────────────────────────
-- 5) Anti-farm : cooldown 3 min entre 2 actions identiques
--    (on réécrit _missions_before_insert en ajoutant le cooldown)
-- ─────────────────────────────────────────────────────────────
create or replace function _missions_before_insert() returns trigger as $$
declare v_streak int; v_plan text; v_count int; v_limit int; v_recip int;
        v_base_p int; v_mult numeric; v_owner uuid; v_budget int; v_potential int;
        v_is_server boolean;
begin
  v_is_server := current_user in ('postgres', 'service_role', 'supabase_admin');

  case new.mission_type
    when 'fav' then v_base_p := 5;   when 'visit' then v_base_p := 3;
    when 'like' then v_base_p := 4;  when 'comment' then v_base_p := 6;
    when 'share' then v_base_p := 10; when 'pin' then v_base_p := 8;
    when 'review' then v_base_p := 15; when 'cart' then v_base_p := 20;
    when 'buy' then v_base_p := 40;
    else raise exception 'UNKNOWN_MISSION_TYPE';
  end case;

  select user_id into v_owner from posts where id = new.post_id;

  if not v_is_server then
    if v_owner = new.user_id then raise exception 'SELF_MISSION'; end if;
    -- cooldown 3 min entre deux actions identiques
    if exists (select 1 from missions where user_id = new.user_id
                 and mission_type = new.mission_type
                 and created_at > now() - interval '3 minutes') then
      raise exception 'COOLDOWN';
    end if;
    select coalesce(streak,0), coalesce(plan,'free') into v_streak, v_plan from profiles where id = new.user_id;
    v_limit := case when v_plan = 'premium' then 30 when v_plan = 'starter' then 20 else 5 end;
    select count(*) into v_count from missions
      where user_id = new.user_id and created_at >= date_trunc('day', now());
    if v_count >= v_limit then raise exception 'LIMIT_REACHED'; end if;
    select count(*) into v_recip from missions mm
      join posts pp on pp.id = mm.post_id
      where mm.user_id = new.user_id and pp.user_id = v_owner
        and mm.created_at > now() - interval '7 days' and mm.status <> 'rejected';
    if v_recip >= 3 then raise exception 'COLLUSION_LIMIT'; end if;
  else
    select coalesce(streak,0) into v_streak from profiles where id = new.user_id;
  end if;

  v_mult := least(1 + floor(coalesce(v_streak,0) / 7.0) * 0.10, 1.5);
  v_potential := round(v_base_p * v_mult);

  if new.mission_type = 'buy' then
    new.cp_earned := v_potential;
  else
    select coalesce(support_budget,0) into v_budget from posts where id = new.post_id;
    new.cp_earned := least(v_potential, greatest(v_budget, 0));
  end if;

  if v_is_server then new.status := coalesce(new.status, 'verified');
  else new.status := 'pending'; end if;

  return new;
end; $$ language plpgsql;

-- ════════════════════════════════════════════════════════════════════════════
-- FIN — CirclUp schema_p4_3_4.sql
-- ════════════════════════════════════════════════════════════════════════════
