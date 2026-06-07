-- ============================================================================
-- CIRCLUP — P1 : SÉCURISATION DE L'ÉCONOMIE
-- ----------------------------------------------------------------------------
-- À exécuter APRÈS schema_complet.sql (Supabase > SQL Editor > Run).
-- Idempotent : ré-exécutable sans danger.
--
-- Objectif : le CLIENT ne peut plus jamais
--   1) se créditer des points (add_points devient interne),
--   2) modifier ses colonnes sensibles (cp, xp, level, plan, is_admin, badges...),
--   3) choisir le montant gagné par une action (barèmes côté serveur via triggers).
--
-- Modèle : le client n'INSÈRE que l'ACTION (post, like, commentaire, mission).
-- Des triggers serveur calculent et créditent les points avec un barème en base.
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════════════
-- A) RPC légitimes : forcer l'usage de auth.uid() (ignore tout user_id client)
-- ════════════════════════════════════════════════════════════════════════════

-- Dépense des points de l'APPELANT uniquement (jamais d'un autre compte)
create or replace function spend_points(p_user_id uuid, p_points integer, p_reason text)
returns boolean as $$
declare v_uid uuid := auth.uid(); v_cp integer;
begin
  if v_uid is null then return false; end if;
  if p_points is null or p_points <= 0 then return false; end if;
  select cp into v_cp from profiles where id = v_uid;
  if v_cp is null or v_cp < p_points then return false; end if;
  update profiles set cp = cp - p_points where id = v_uid;
  insert into points_history(user_id, amount, type, reason) values(v_uid, p_points, 'spent', p_reason);
  return true;
end; $$ language plpgsql security definer;

-- Coffre quotidien de l'APPELANT
create or replace function open_daily_chest(p_user_id uuid)
returns integer as $$
declare v_uid uuid := auth.uid(); v_reward integer; v_rand float; v_already boolean;
begin
  if v_uid is null then return -1; end if;
  select exists(select 1 from daily_chest where user_id = v_uid and opened_at = current_date) into v_already;
  if v_already then return -1; end if;
  v_rand := random();
  v_reward := case
    when v_rand >= 0.99 then 500 when v_rand >= 0.95 then 100
    when v_rand >= 0.85 then 50  when v_rand >= 0.60 then 20 else 10 end;
  insert into daily_chest(user_id, opened_at, reward_points) values(v_uid, current_date, v_reward);
  perform add_points(v_uid, v_reward, v_reward / 2, 'Coffre quotidien');
  return v_reward;
end; $$ language plpgsql security definer;

-- Série de connexion de l'APPELANT
create or replace function update_daily_streak(p_user_id uuid)
returns integer as $$
declare v_uid uuid := auth.uid(); v_last date; v_streak integer; v_bonus integer := 0;
begin
  if v_uid is null then return 0; end if;
  select last_login, streak into v_last, v_streak from profiles where id = v_uid;
  if v_last = current_date then return v_streak; end if;
  if v_last = current_date - 1 then v_streak := coalesce(v_streak,0) + 1; else v_streak := 1; end if;
  v_bonus := case when v_streak = 100 then 500 when v_streak = 30 then 150
                  when v_streak = 7 then 40 when v_streak = 3 then 15 else 0 end;
  update profiles set streak = v_streak, last_login = current_date where id = v_uid;
  if v_bonus > 0 then perform add_points(v_uid, v_bonus, v_bonus, 'Bonus série ' || v_streak || ' jours'); end if;
  return v_streak;
end; $$ language plpgsql security definer;

-- Génère le code de parrainage de l'APPELANT
create or replace function generate_referral_code(p_user_id uuid)
returns text as $$
declare v_uid uuid := auth.uid(); v_code text;
begin
  if v_uid is null then return null; end if;
  select referral_code into v_code from profiles where id = v_uid;
  if v_code is not null then return v_code; end if;
  v_code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  update profiles set referral_code = v_code where id = v_uid;
  return v_code;
end; $$ language plpgsql security definer;

-- ════════════════════════════════════════════════════════════════════════════
-- B) Verrouiller le moteur de points : inappelable depuis le client
-- ════════════════════════════════════════════════════════════════════════════
revoke execute on function add_points(uuid, integer, integer, text)   from public, anon, authenticated;
revoke execute on function update_quest_progress(uuid, text, integer)  from public, anon, authenticated;
revoke execute on function increment_post_stat(uuid, text)             from public, anon, authenticated;
revoke execute on function increment_post_likes(uuid)                  from public, anon, authenticated;
revoke execute on function decrement_post_likes(uuid)                  from public, anon, authenticated;
revoke execute on function increment_comments_count(uuid)             from public, anon, authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- C) Garde-fou sur PROFILES — le client ne peut pas toucher l'économie
--    (fonctions SECURITY INVOKER : current_user = vrai rôle de session)
-- ════════════════════════════════════════════════════════════════════════════

-- À l'INSERT (inscription) : forcer les valeurs serveur, ignorer ce que le client envoie
create or replace function _guard_profile_insert() returns trigger as $$
begin
  if current_user not in ('postgres', 'service_role', 'supabase_admin') then
    new.cp := 50; new.xp := 0; new.level := 1; new.league := 'Bronze';
    new.rank := 'Starter'; new.reputation := 5.0; new.streak := 0;
    new.badges := '{}'; new.plan := 'free'; new.is_admin := false;
    new.is_subscribed := false; new.is_active := true;
    new.referral_code := null; new.referred_by := null;
    new.stripe_customer_id := null; new.last_login := null;
  end if;
  return new;
end; $$ language plpgsql;

-- À l'UPDATE : un client ne peut PAS modifier les colonnes économiques/statut
create or replace function _guard_profile_update() returns trigger as $$
begin
  if current_user not in ('postgres', 'service_role', 'supabase_admin') then
    new.cp := old.cp; new.xp := old.xp; new.level := old.level;
    new.league := old.league; new.rank := old.rank; new.reputation := old.reputation;
    new.streak := old.streak; new.last_login := old.last_login;
    new.badges := old.badges; new.plan := old.plan;
    new.is_admin := old.is_admin; new.is_subscribed := old.is_subscribed;
    new.is_active := old.is_active; new.stripe_customer_id := old.stripe_customer_id;
    new.referral_code := old.referral_code; new.referred_by := old.referred_by;
  end if;
  return new;
end; $$ language plpgsql;

-- Crédit de bienvenue (historique) — côté serveur
create or replace function _profile_after_insert() returns trigger as $$
begin
  insert into points_history(user_id, amount, type, reason)
    values (new.id, 50, 'earned', 'Points de bienvenue');
  return new;
end; $$ language plpgsql security definer;

drop trigger if exists trg_guard_profile_insert on profiles;
create trigger trg_guard_profile_insert before insert on profiles
  for each row execute function _guard_profile_insert();

drop trigger if exists trg_guard_profile_update on profiles;
create trigger trg_guard_profile_update before update on profiles
  for each row execute function _guard_profile_update();

drop trigger if exists trg_profile_after_insert on profiles;
create trigger trg_profile_after_insert after insert on profiles
  for each row execute function _profile_after_insert();

-- Le crédit de bienvenue vient désormais du serveur : on retire le droit
-- d'insertion d'historique côté client.
drop policy if exists "ph_insert" on points_history;

-- ════════════════════════════════════════════════════════════════════════════
-- D) CRÉDIT AUTOMATIQUE par triggers (barème serveur)  [SECURITY DEFINER]
-- ════════════════════════════════════════════════════════════════════════════

-- Publication d'un post → auteur +10/+15
create or replace function _posts_after_insert() returns trigger as $$
begin
  perform add_points(new.user_id, 10, 15, 'Publication d''un post');
  return new;
end; $$ language plpgsql security definer;

drop trigger if exists trg_posts_after_insert on posts;
create trigger trg_posts_after_insert after insert on posts
  for each row execute function _posts_after_insert();

-- Like reçu → propriétaire +2/+3, et compteur likes_count
create or replace function _post_likes_after_insert() returns trigger as $$
declare v_owner uuid;
begin
  update posts set likes_count = likes_count + 1 where id = new.post_id;
  select user_id into v_owner from posts where id = new.post_id;
  if v_owner is not null and v_owner <> new.user_id then
    perform add_points(v_owner, 2, 3, 'Like reçu');
  end if;
  return new;
end; $$ language plpgsql security definer;

create or replace function _post_likes_after_delete() returns trigger as $$
begin
  update posts set likes_count = greatest(0, likes_count - 1) where id = old.post_id;
  return old;
end; $$ language plpgsql security definer;

drop trigger if exists trg_post_likes_ins on post_likes;
create trigger trg_post_likes_ins after insert on post_likes
  for each row execute function _post_likes_after_insert();
drop trigger if exists trg_post_likes_del on post_likes;
create trigger trg_post_likes_del after delete on post_likes
  for each row execute function _post_likes_after_delete();

-- Commentaire → auteur +6/+10 (1 SEULE fois par post, jamais sur son propre post),
-- compteur + notif + quête au propriétaire
create or replace function _comments_after_insert() returns trigger as $$
declare v_owner uuid; v_cnt integer;
begin
  update posts set comments_count = comments_count + 1 where id = new.post_id;
  select user_id into v_owner from posts where id = new.post_id;
  if v_owner is not null and v_owner <> new.user_id then
    select count(*) into v_cnt from comments where post_id = new.post_id and user_id = new.user_id;
    if v_cnt = 1 then   -- premier commentaire de cet utilisateur sur ce post
      perform add_points(new.user_id, 6, 10, 'Commentaire publié');
      insert into notifications(user_id, type, message, post_id)
        values (v_owner, 'comment', 'Quelqu''un a commenté ton post !', new.post_id);
      perform update_quest_progress(v_owner, 'comments_received', 1);
    end if;
  end if;
  return new;
end; $$ language plpgsql security definer;

create or replace function _comments_after_delete() returns trigger as $$
begin
  update posts set comments_count = greatest(0, comments_count - 1) where id = old.post_id;
  return old;
end; $$ language plpgsql security definer;

drop trigger if exists trg_comments_ins on comments;
create trigger trg_comments_ins after insert on comments
  for each row execute function _comments_after_insert();
drop trigger if exists trg_comments_del on comments;
create trigger trg_comments_del after delete on comments
  for each row execute function _comments_after_delete();

-- ════════════════════════════════════════════════════════════════════════════
-- E) MISSIONS — barème + limites + crédit, 100% serveur
-- ════════════════════════════════════════════════════════════════════════════

-- AVANT insert : calcule cp_earned (barème serveur), bloque self-mission & limite/jour
create or replace function _missions_before_insert() returns trigger as $$
declare v_streak int; v_plan text; v_count int; v_limit int;
        v_base_p int; v_mult numeric; v_owner uuid;
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
  new.cp_earned := round(v_base_p * v_mult);
  return new;
end; $$ language plpgsql;

-- APRÈS insert : crédite l'acteur + stat post + récompense/notif au propriétaire + quête
create or replace function _missions_after_insert() returns trigger as $$
declare v_owner uuid; v_streak int; v_mult numeric; v_base_x int; v_xp int; v_stat text;
begin
  select user_id into v_owner from posts where id = new.post_id;
  select coalesce(streak,0) into v_streak from profiles where id = new.user_id;
  v_mult := least(1 + floor(coalesce(v_streak,0) / 7.0) * 0.10, 1.5);

  v_base_x := case new.mission_type
    when 'fav' then 8 when 'visit' then 5 when 'like' then 6 when 'comment' then 10
    when 'share' then 15 when 'pin' then 12 when 'review' then 22 when 'cart' then 30
    when 'buy' then 60 else 0 end;
  v_xp := round(v_base_x * v_mult);

  perform add_points(new.user_id, new.cp_earned, v_xp, 'Mission : ' || new.mission_type);

  v_stat := case new.mission_type
    when 'fav' then 'favorites' when 'share' then 'shares' when 'review' then 'reviews'
    when 'buy' then 'buys' when 'like' then 'likes' else null end;
  if v_stat is not null then
    execute format('update posts set %I = %I + 1 where id = $1', v_stat||'_count', v_stat||'_count') using new.post_id;
  end if;

  if v_owner is not null and v_owner <> new.user_id then
    perform add_points(v_owner, 2, 3, 'Mission reçue sur ton post');
    insert into notifications(user_id, type, message, post_id)
      values (v_owner, new.mission_type,
              'Quelqu''un a fait une mission "' || new.mission_type || '" sur ton post !', new.post_id);
  end if;

  perform update_quest_progress(new.user_id, 'missions_count', 1);
  return new;
end; $$ language plpgsql security definer;

drop trigger if exists trg_missions_before on missions;
create trigger trg_missions_before before insert on missions
  for each row execute function _missions_before_insert();
drop trigger if exists trg_missions_after on missions;
create trigger trg_missions_after after insert on missions
  for each row execute function _missions_after_insert();

-- ════════════════════════════════════════════════════════════════════════════
-- F) RPC contrôlées pour les écritures légitimes restantes
-- ════════════════════════════════════════════════════════════════════════════

-- Parrainage : l'appelant déclare son code parrain (une seule fois)
create or replace function apply_referral(p_code text)
returns boolean as $$
declare v_uid uuid := auth.uid(); v_ref uuid; v_existing uuid;
begin
  if v_uid is null or p_code is null or btrim(p_code) = '' then return false; end if;
  select referred_by into v_existing from profiles where id = v_uid;
  if v_existing is not null then return false; end if;
  select id into v_ref from profiles where referral_code = upper(btrim(p_code));
  if v_ref is null or v_ref = v_uid then return false; end if;
  update profiles set referred_by = v_ref where id = v_uid;
  perform add_points(v_ref, 200, 100, 'Parrainage accepté');
  return true;
end; $$ language plpgsql security definer;

-- Achat du badge VIP (coût serveur = 500 CP)
create or replace function purchase_vip_badge()
returns boolean as $$
declare v_uid uuid := auth.uid(); v_cp integer;
begin
  if v_uid is null then return false; end if;
  select cp into v_cp from profiles where id = v_uid;
  if v_cp is null or v_cp < 500 then return false; end if;
  update profiles
     set cp = cp - 500,
         badges = case when badges @> array['👑'] then badges else array_append(badges, '👑') end
   where id = v_uid;
  insert into points_history(user_id, amount, type, reason) values(v_uid, 500, 'spent', 'Badge VIP 30 jours');
  return true;
end; $$ language plpgsql security definer;

-- Confirmation d'achat par le VENDEUR (crédite l'acheteur via la mission 'buy')
create or replace function confirm_purchase(p_confirmation_id uuid)
returns boolean as $$
declare c purchase_confirmations%rowtype;
begin
  select * into c from purchase_confirmations where id = p_confirmation_id;
  if not found then return false; end if;
  if c.seller_id <> auth.uid() then raise exception 'NOT_SELLER'; end if;
  if c.status <> 'pending' then return false; end if;
  update purchase_confirmations set status = 'confirmed', confirmed_at = now() where id = c.id;
  insert into missions(post_id, user_id, mission_type, cp_earned)
    values (c.post_id, c.buyer_id, 'buy', 0)
    on conflict (post_id, user_id, mission_type) do nothing;
  insert into notifications(user_id, type, message, post_id)
    values (c.buyer_id, 'buy', 'Ton achat a été confirmé ! +40 CP crédités 🎉', c.post_id);
  return true;
end; $$ language plpgsql security definer;

create or replace function reject_purchase(p_confirmation_id uuid)
returns boolean as $$
declare c purchase_confirmations%rowtype;
begin
  select * into c from purchase_confirmations where id = p_confirmation_id;
  if not found then return false; end if;
  if c.seller_id <> auth.uid() then raise exception 'NOT_SELLER'; end if;
  if c.status <> 'pending' then return false; end if;
  update purchase_confirmations set status = 'rejected' where id = c.id;
  insert into notifications(user_id, type, message)
    values (c.buyer_id, 'info', 'Ton achat sur ce post n''a pas pu être confirmé par le vendeur.');
  return true;
end; $$ language plpgsql security definer;

-- Actions ADMIN (vérifient que l'appelant est admin côté serveur)
create or replace function admin_set_admin(p_target uuid, p_value boolean)
returns boolean as $$
begin
  if not coalesce((select is_admin from profiles where id = auth.uid()), false) then
    raise exception 'NOT_ADMIN';
  end if;
  update profiles set is_admin = p_value where id = p_target;
  return true;
end; $$ language plpgsql security definer;

create or replace function admin_set_active(p_target uuid, p_value boolean)
returns boolean as $$
begin
  if not coalesce((select is_admin from profiles where id = auth.uid()), false) then
    raise exception 'NOT_ADMIN';
  end if;
  update profiles set is_active = p_value where id = p_target;
  return true;
end; $$ language plpgsql security definer;

-- L'admin peut supprimer n'importe quel post (en plus du propriétaire)
drop policy if exists "posts_delete_admin" on posts;
create policy "posts_delete_admin" on posts for delete
  using (coalesce((select is_admin from profiles where id = auth.uid()), false));

-- ════════════════════════════════════════════════════════════════════════════
-- FIN — CirclUp schema_p1_security.sql
-- ════════════════════════════════════════════════════════════════════════════
