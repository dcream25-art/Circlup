-- ============================================================================
-- CIRCLUP — P2.5 : ÉCONOMIE CP EN CIRCULATION
-- ----------------------------------------------------------------------------
-- À exécuter APRÈS schema_complet.sql + schema_p1_security.sql.
-- Idempotent. Transforme la frappe de CP en circulation (anti-inflation).
--
-- Principe :
--   • Pour RECEVOIR du soutien, l'auteur DOTE son post d'un budget CP (escrow).
--   • Faire une mission = TRANSFERT des CP du budget du post vers le faiseur.
--   • Like / commentaire / publication = 0 CP (actions sociales).
--   • Exception : la mission 'buy' FRAPPE 40 CP (adossée à une vraie vente).
--   • Réciprocité : notif "rends-lui la pareille" avec l'auteur de la mission.
--   • Puits réel : conversion CP → crédit de réduction d'abonnement.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────
-- 1) Colonnes
-- ─────────────────────────────────────────────────────────────
alter table posts        add column if not exists support_budget        integer default 0;
alter table profiles     add column if not exists discount_credit_cents integer default 0;
alter table notifications add column if not exists actor_username        text;

-- ─────────────────────────────────────────────────────────────
-- 2) Moteur de points : ne plus écrire d'historique pour 0 CP
--    (un crédit de 0 CP = juste de l'XP/progression, pas une ligne d'historique)
-- ─────────────────────────────────────────────────────────────
create or replace function add_points(
  p_user_id uuid, p_points integer, p_xp integer default 0, p_reason text default ''
) returns jsonb as $$
declare v_new_cp integer; v_new_xp integer; v_new_level integer; v_new_league text;
begin
  update profiles set cp = cp + p_points, xp = xp + p_xp
  where id = p_user_id returning cp, xp into v_new_cp, v_new_xp;

  v_new_level := case
    when v_new_xp >= 10000 then 6 when v_new_xp >= 5000 then 5
    when v_new_xp >= 2000  then 4 when v_new_xp >= 750  then 3
    when v_new_xp >= 200   then 2 else 1 end;
  v_new_league := case
    when v_new_cp >= 5000 then 'Légende' when v_new_cp >= 2000 then 'Diamant'
    when v_new_cp >= 1000 then 'Or'      when v_new_cp >= 400  then 'Argent'
    else 'Bronze' end;
  update profiles set level = v_new_level, league = v_new_league where id = p_user_id;

  if p_points <> 0 then
    insert into points_history(user_id, amount, type, reason)
      values(p_user_id, p_points, 'earned', p_reason);
  end if;
  update profiles set is_active = (v_new_cp > 0) where id = p_user_id;

  return jsonb_build_object('cp', v_new_cp, 'xp', v_new_xp, 'level', v_new_level, 'league', v_new_league);
end; $$ language plpgsql security definer;
revoke execute on function add_points(uuid, integer, integer, text) from public, anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- 3) Doter un post (escrow) : déplace des CP de l'auteur vers le budget du post
-- ─────────────────────────────────────────────────────────────
create or replace function fund_post(p_post_id uuid, p_amount integer)
returns boolean as $$
declare v_uid uuid := auth.uid(); v_owner uuid; v_cp integer;
begin
  if v_uid is null or p_amount is null or p_amount <= 0 then return false; end if;
  select user_id into v_owner from posts where id = p_post_id;
  if v_owner is null or v_owner <> v_uid then return false; end if;       -- seul l'auteur dote
  select cp into v_cp from profiles where id = v_uid;
  if v_cp is null or v_cp < p_amount then return false; end if;
  update profiles set cp = cp - p_amount where id = v_uid;
  insert into points_history(user_id, amount, type, reason)
    values(v_uid, p_amount, 'spent', 'Dotation de post (soutien)');
  update posts set support_budget = coalesce(support_budget,0) + p_amount where id = p_post_id;
  return true;
end; $$ language plpgsql security definer;

-- ─────────────────────────────────────────────────────────────
-- 4) Remboursement du budget non dépensé si le post est supprimé
-- ─────────────────────────────────────────────────────────────
create or replace function _posts_before_delete() returns trigger as $$
begin
  if coalesce(old.support_budget,0) > 0 and old.user_id is not null then
    perform add_points(old.user_id, old.support_budget, 0, 'Remboursement dotation (post supprimé)');
  end if;
  return old;
end; $$ language plpgsql security definer;

drop trigger if exists trg_posts_before_delete on posts;
create trigger trg_posts_before_delete before delete on posts
  for each row execute function _posts_before_delete();

-- ─────────────────────────────────────────────────────────────
-- 5) Publication d'un post : ne FRAPPE plus de CP (le post se "rentabilise"
--    en recevant du soutien, pas en étant créé)
-- ─────────────────────────────────────────────────────────────
drop trigger if exists trg_posts_after_insert on posts;
drop function if exists _posts_after_insert();

-- ─────────────────────────────────────────────────────────────
-- 6) Like : compte seulement, plus de CP au propriétaire
-- ─────────────────────────────────────────────────────────────
create or replace function _post_likes_after_insert() returns trigger as $$
begin
  update posts set likes_count = likes_count + 1 where id = new.post_id;
  return new;
end; $$ language plpgsql security definer;

-- ─────────────────────────────────────────────────────────────
-- 7) Commentaire : compte + notif + quête, plus de CP au commentateur
-- ─────────────────────────────────────────────────────────────
create or replace function _comments_after_insert() returns trigger as $$
declare v_owner uuid;
begin
  update posts set comments_count = comments_count + 1 where id = new.post_id;
  select user_id into v_owner from posts where id = new.post_id;
  if v_owner is not null and v_owner <> new.user_id then
    insert into notifications(user_id, type, message, post_id)
      values (v_owner, 'comment', 'Quelqu''un a commenté ton post !', new.post_id);
    perform update_quest_progress(v_owner, 'comments_received', 1);
  end if;
  return new;
end; $$ language plpgsql security definer;

-- ─────────────────────────────────────────────────────────────
-- 8) MISSIONS — cœur de la circulation
--    cp_earned = min(barème, budget du post)  [transfert]
--    sauf 'buy' = barème plein  [frappe, adossée à une vraie vente]
-- ─────────────────────────────────────────────────────────────
create or replace function _missions_before_insert() returns trigger as $$
declare v_streak int; v_plan text; v_count int; v_limit int;
        v_base_p int; v_mult numeric; v_owner uuid; v_budget int; v_potential int;
begin
  case new.mission_type
    when 'fav'     then v_base_p := 5;
    when 'visit'   then v_base_p := 3;
    when 'like'    then v_base_p := 4;
    when 'comment' then v_base_p := 6;
    when 'share'   then v_base_p := 10;
    when 'pin'     then v_base_p := 8;
    when 'review'  then v_base_p := 15;
    when 'cart'    then v_base_p := 20;
    when 'buy'     then v_base_p := 40;
    else raise exception 'UNKNOWN_MISSION_TYPE';
  end case;

  if current_user not in ('postgres', 'service_role', 'supabase_admin') then
    select user_id into v_owner from posts where id = new.post_id;
    if v_owner = new.user_id then raise exception 'SELF_MISSION'; end if;
    select coalesce(streak,0), coalesce(plan,'free') into v_streak, v_plan
      from profiles where id = new.user_id;
    v_limit := case when v_plan = 'premium' then 30 else 5 end;
    select count(*) into v_count from missions
      where user_id = new.user_id and created_at >= date_trunc('day', now());
    if v_count >= v_limit then raise exception 'LIMIT_REACHED'; end if;
  else
    select coalesce(streak,0) into v_streak from profiles where id = new.user_id;
  end if;

  v_mult := least(1 + floor(coalesce(v_streak,0) / 7.0) * 0.10, 1.5);
  v_potential := round(v_base_p * v_mult);

  if new.mission_type = 'buy' then
    new.cp_earned := v_potential;                                    -- frappe
  else
    select coalesce(support_budget,0) into v_budget from posts where id = new.post_id;
    new.cp_earned := least(v_potential, greatest(v_budget, 0));      -- transfert plafonné au budget
  end if;
  return new;
end; $$ language plpgsql;

create or replace function _missions_after_insert() returns trigger as $$
declare v_owner uuid; v_streak int; v_mult numeric; v_base_x int; v_xp int; v_stat text; v_actor text;
begin
  select user_id into v_owner from posts where id = new.post_id;
  select coalesce(streak,0) into v_streak from profiles where id = new.user_id;
  v_mult := least(1 + floor(coalesce(v_streak,0) / 7.0) * 0.10, 1.5);
  v_base_x := case new.mission_type
    when 'fav' then 8 when 'visit' then 5 when 'like' then 6 when 'comment' then 10
    when 'share' then 15 when 'pin' then 12 when 'review' then 22 when 'cart' then 30
    when 'buy' then 60 else 0 end;
  v_xp := round(v_base_x * v_mult);

  -- Débiter le budget du post (transfert) — sauf 'buy' qui est frappé
  if new.mission_type <> 'buy' and new.cp_earned > 0 then
    update posts set support_budget = greatest(0, coalesce(support_budget,0) - new.cp_earned)
      where id = new.post_id;
  end if;

  -- Créditer le faiseur : CP (transfert/frappe, peut être 0) + XP (toujours, progression)
  perform add_points(new.user_id, new.cp_earned, v_xp, 'Mission : ' || new.mission_type);

  -- Compteur de stat du post
  v_stat := case new.mission_type
    when 'fav' then 'favorites' when 'share' then 'shares' when 'review' then 'reviews'
    when 'buy' then 'buys' when 'like' then 'likes' else null end;
  if v_stat is not null then
    execute format('update posts set %I = %I + 1 where id = $1', v_stat||'_count', v_stat||'_count') using new.post_id;
  end if;

  -- Notif réciprocité au propriétaire (AUCUN CP frappé pour lui)
  if v_owner is not null and v_owner <> new.user_id then
    select username into v_actor from profiles where id = new.user_id;
    insert into notifications(user_id, type, message, post_id, actor_username)
      values (v_owner, new.mission_type,
        'Quelqu''un a soutenu ton post — rends-lui la pareille !', new.post_id, v_actor);
  end if;

  perform update_quest_progress(new.user_id, 'missions_count', 1);
  return new;
end; $$ language plpgsql security definer;

-- (les triggers eux-mêmes existent déjà depuis P1 ; CREATE OR REPLACE des fonctions suffit)

-- ─────────────────────────────────────────────────────────────
-- 9) Puits réel : convertir des CP en crédit de réduction d'abonnement
--    1000 CP = 100 cents (1 €). Multiples de 1000 uniquement.
--    Le crédit (discount_credit_cents) sera appliqué au paiement Stripe (P2).
-- ─────────────────────────────────────────────────────────────
create or replace function redeem_cp_for_discount(p_cp integer)
returns boolean as $$
declare v_uid uuid := auth.uid(); v_cp integer;
begin
  if v_uid is null or p_cp is null or p_cp < 1000 or (p_cp % 1000) <> 0 then return false; end if;
  select cp into v_cp from profiles where id = v_uid;
  if v_cp is null or v_cp < p_cp then return false; end if;
  update profiles
    set cp = cp - p_cp,
        discount_credit_cents = coalesce(discount_credit_cents,0) + (p_cp / 1000) * 100
    where id = v_uid;
  insert into points_history(user_id, amount, type, reason)
    values(v_uid, p_cp, 'spent', 'Conversion CP → réduction abo');
  return true;
end; $$ language plpgsql security definer;

-- ════════════════════════════════════════════════════════════════════════════
-- FIN — CirclUp schema_p2_5.sql
-- ════════════════════════════════════════════════════════════════════════════
