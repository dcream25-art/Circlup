-- ============================================================================
-- CIRCLUP — P3 : VÉRIFICATION DES MISSIONS (crédit après preuve)
-- ----------------------------------------------------------------------------
-- À exécuter APRÈS schema_complet + p1 + p2_5. Idempotent.
--
-- Modèle :
--   • Les CP d'une mission sont RÉSERVÉS sur le budget du post dès l'insertion.
--   • status = 'pending' tant que non vérifié ; 'verified' = crédité à A ;
--     'rejected'/'expired' = CP rendus au budget, A non crédité.
--   • Visite : insérée 'verified' par le serveur (/api/go) au clic tracké.
--   • Follow/favori/partage/avis : 'pending' → validés par B, ou auto après 72h.
--   • Achat ('buy') : 'verified' (frappe), via confirm_purchase / webhook.
--   • Anti-collusion : max 3 missions/7j d'un même A vers les posts d'un même B.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────
-- 1) Colonnes & tables
-- ─────────────────────────────────────────────────────────────
alter table missions add column if not exists status      text default 'verified'; -- legacy = verified
alter table missions add column if not exists verified_at timestamptz;

-- Journal des clics tracés (lien /api/go) — preuve serveur de visite
create table if not exists mission_clicks (
  id          uuid primary key default gen_random_uuid(),
  token       text unique not null,
  actor_id    uuid references profiles(id) on delete cascade,
  post_id     uuid references posts(id) on delete cascade,
  mission_type text not null,
  target_url  text,
  created_at  timestamptz default now(),
  clicked_at  timestamptz,           -- rempli quand le lien est réellement suivi
  consumed    boolean default false  -- token à usage unique
);
alter table mission_clicks enable row level security;
drop policy if exists "clicks_insert" on mission_clicks;
create policy "clicks_insert" on mission_clicks for insert with check (auth.uid() = actor_id);
drop policy if exists "clicks_select" on mission_clicks;
create policy "clicks_select" on mission_clicks for select using (auth.uid() = actor_id);

-- Connexion boutique des membres (Phase 3 webhooks Shopify/Etsy)
create table if not exists shop_connections (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id) on delete cascade,
  provider      text not null,          -- 'shopify' | 'etsy'
  shop_domain   text,
  access_token  text,                   -- chiffré/serveur uniquement
  webhook_secret text,
  connected_at  timestamptz default now(),
  unique(user_id, provider)
);
alter table shop_connections enable row level security;
-- Aucune policy : accessible uniquement via service_role (serveur). Le client ne lit jamais les tokens.

-- ─────────────────────────────────────────────────────────────
-- 2) Crédit d'une mission (factorisé) — interne
-- ─────────────────────────────────────────────────────────────
create or replace function _credit_mission(m missions) returns void as $$
declare v_owner uuid; v_streak int; v_mult numeric; v_base_x int; v_xp int; v_stat text; v_actor text;
begin
  select user_id into v_owner from posts where id = m.post_id;
  select coalesce(streak,0) into v_streak from profiles where id = m.user_id;
  v_mult := least(1 + floor(coalesce(v_streak,0) / 7.0) * 0.10, 1.5);
  v_base_x := case m.mission_type
    when 'fav' then 8 when 'visit' then 5 when 'like' then 6 when 'comment' then 10
    when 'share' then 15 when 'pin' then 12 when 'review' then 22 when 'cart' then 30
    when 'buy' then 60 else 0 end;
  v_xp := round(v_base_x * v_mult);

  perform add_points(m.user_id, m.cp_earned, v_xp, 'Mission : ' || m.mission_type);

  v_stat := case m.mission_type
    when 'fav' then 'favorites' when 'share' then 'shares' when 'review' then 'reviews'
    when 'buy' then 'buys' when 'like' then 'likes' else null end;
  if v_stat is not null then
    execute format('update posts set %I = %I + 1 where id = $1', v_stat||'_count', v_stat||'_count') using m.post_id;
  end if;

  if v_owner is not null and v_owner <> m.user_id then
    select username into v_actor from profiles where id = m.user_id;
    insert into notifications(user_id, type, message, post_id, actor_username)
      values (v_owner, m.mission_type, 'Quelqu''un a soutenu ton post — rends-lui la pareille !', m.post_id, v_actor);
  end if;

  perform update_quest_progress(m.user_id, 'missions_count', 1);
end; $$ language plpgsql security definer;

-- ─────────────────────────────────────────────────────────────
-- 3) AVANT INSERT : barème + limites + anti-collusion + statut + RÉSERVATION
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
    select coalesce(streak,0), coalesce(plan,'free') into v_streak, v_plan from profiles where id = new.user_id;
    v_limit := case when v_plan = 'premium' then 30 else 5 end;
    select count(*) into v_count from missions
      where user_id = new.user_id and created_at >= date_trunc('day', now());
    if v_count >= v_limit then raise exception 'LIMIT_REACHED'; end if;
    -- anti-collusion : A → posts de B, 7 derniers jours (hors refusées)
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
    new.cp_earned := v_potential;                                   -- frappe (vraie vente)
  else
    select coalesce(support_budget,0) into v_budget from posts where id = new.post_id;
    new.cp_earned := least(v_potential, greatest(v_budget, 0));     -- plafonné au budget
  end if;

  -- Statut : le client ne peut PAS s'auto-valider. Seul le serveur insère 'verified'.
  if v_is_server then new.status := coalesce(new.status, 'verified');
  else new.status := 'pending'; end if;

  return new;
end; $$ language plpgsql;

-- ─────────────────────────────────────────────────────────────
-- 4) APRÈS INSERT : réserver le budget + créditer si déjà vérifié, sinon notifier B
-- ─────────────────────────────────────────────────────────────
create or replace function _missions_after_insert() returns trigger as $$
declare v_owner uuid; v_actor text;
begin
  -- Réserver (débiter) le budget du post — sauf 'buy' (frappe)
  if new.mission_type <> 'buy' and new.cp_earned > 0 then
    update posts set support_budget = greatest(0, coalesce(support_budget,0) - new.cp_earned)
      where id = new.post_id;
  end if;

  if new.status = 'verified' then
    perform _credit_mission(new);
  else
    -- en attente : prévenir B (preuve à valider, sinon auto sous 72h)
    select user_id into v_owner from posts where id = new.post_id;
    if v_owner is not null and v_owner <> new.user_id then
      select username into v_actor from profiles where id = new.user_id;
      insert into notifications(user_id, type, message, post_id, actor_username)
        values (v_owner, 'mission_pending',
          'Un membre a réalisé une mission sur ton post — valide ou refuse (validé automatiquement sous 72h).',
          new.post_id, v_actor);
    end if;
  end if;
  return new;
end; $$ language plpgsql security definer;

-- ─────────────────────────────────────────────────────────────
-- 5) APRÈS UPDATE : validation/refus
-- ─────────────────────────────────────────────────────────────
create or replace function _missions_after_update() returns trigger as $$
begin
  if old.status = 'pending' and new.status = 'verified' then
    perform _credit_mission(new);
    insert into notifications(user_id, type, message, post_id)
      values (new.user_id, 'info', 'Ta mission a été validée ! CP crédités 🎉', new.post_id);
  elsif old.status = 'pending' and new.status = 'rejected' then
    if new.mission_type <> 'buy' and new.cp_earned > 0 then
      update posts set support_budget = coalesce(support_budget,0) + new.cp_earned where id = new.post_id;
    end if;
    insert into notifications(user_id, type, message, post_id)
      values (new.user_id, 'info', 'Ta mission n''a pas été validée — CP non crédités.', new.post_id);
  end if;
  return new;
end; $$ language plpgsql security definer;

drop trigger if exists trg_missions_after_update on missions;
create trigger trg_missions_after_update after update on missions
  for each row execute function _missions_after_update();

-- ─────────────────────────────────────────────────────────────
-- 6) RPC : le bénéficiaire valide/refuse une mission en attente
-- ─────────────────────────────────────────────────────────────
create or replace function validate_mission(p_mission_id uuid, p_approve boolean)
returns boolean as $$
declare m missions%rowtype; v_owner uuid;
begin
  select * into m from missions where id = p_mission_id;
  if not found or m.status <> 'pending' then return false; end if;
  select user_id into v_owner from posts where id = m.post_id;
  if v_owner <> auth.uid() then raise exception 'NOT_OWNER'; end if;
  update missions
    set status = case when p_approve then 'verified' else 'rejected' end,
        verified_at = case when p_approve then now() else null end
    where id = p_mission_id;
  return true;
end; $$ language plpgsql security definer;

-- ─────────────────────────────────────────────────────────────
-- 7) Auto-validation après 72h (pg_cron). Toléré si pg_cron indisponible.
-- ─────────────────────────────────────────────────────────────
create or replace function auto_verify_pending() returns void as $$
begin
  update missions set status = 'verified', verified_at = now()
  where status = 'pending' and created_at < now() - interval '72 hours';
end; $$ language plpgsql security definer;

do $$
begin
  create extension if not exists pg_cron;
  begin perform cron.unschedule('circlup-auto-verify'); exception when others then null; end;
  perform cron.schedule('circlup-auto-verify', '7 * * * *', 'select auto_verify_pending()');
exception when others then
  raise notice 'pg_cron indisponible — activer l''extension pg_cron dans le dashboard, ou planifier auto_verify_pending() autrement.';
end $$;

-- ════════════════════════════════════════════════════════════════════════════
-- FIN — CirclUp schema_p3_verify.sql
-- ════════════════════════════════════════════════════════════════════════════
