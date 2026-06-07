-- ============================================================================
-- CIRCLUP — SCHÉMA COMPLET (source unique de vérité)
-- ----------------------------------------------------------------------------
-- Remplace : schema.sql + schema-update.sql + schema-profile-social.sql
--            + schema-projects.sql + schema-mission-proof.sql
--
-- UTILISATION : Supabase > SQL Editor > New Query > coller TOUT ce fichier > Run.
-- Idempotent : ré-exécutable sans danger. Conçu pour une base FRAÎCHE,
-- mais gère aussi une base partielle (ALTER ... ADD COLUMN IF NOT EXISTS).
--
-- ⚠️ SÉCURITÉ — connue et VOLONTAIREMENT non corrigée à ce stade (P0 = "ça tourne") :
--    - La policy UPDATE sur "profiles" laisse l'utilisateur modifier ses propres
--      colonnes sensibles (cp, xp, level, plan, is_admin). À VERROUILLER en P1.
--    - add_points / spend_points sont appelables par le client. À VERROUILLER en P1.
--    Ne PAS ouvrir au public avant le palier P1.
-- ============================================================================

create extension if not exists pgcrypto;

-- ════════════════════════════════════════════════════════════════════════════
-- 1) PROFILES
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists profiles (
  id                  uuid references auth.users primary key,
  email               text unique not null,
  name                text not null,
  shop_name           text not null default '',
  shop_url            text not null default '',
  niche               text,
  bio                 text,
  goal                text,
  avatar_color        text default '#7ecfc0',
  avatar_url          text,
  banner_url          text,
  cp                  integer default 50,
  xp                  integer default 0,
  level               integer default 1,
  rank                text default 'Starter',
  league              text default 'Bronze',
  reputation          numeric(3,1) default 5.0,
  streak              integer default 0,
  last_login          date,
  badges              text[] default '{}',
  plan                text default 'free',
  username            text unique,
  referral_code       text unique,
  referred_by         uuid references profiles(id),
  onboarding_completed boolean default false,
  is_admin            boolean default false,
  is_active           boolean default true,
  is_subscribed       boolean default false,
  stripe_customer_id  text,
  sales_channel       text default 'etsy',
  cercle_id           uuid,
  website             text,
  instagram           text,
  facebook            text,
  snapchat            text,
  tiktok              text,
  youtube             text,
  pinterest           text,
  twitter             text,
  etsy_url            text,
  shopify_url         text,
  created_at          timestamptz default now()
);

-- Rattrapage si la table existait déjà (ancien schema.sql) :
alter table profiles add column if not exists niche               text;
alter table profiles add column if not exists bio                 text;
alter table profiles add column if not exists goal                text;
alter table profiles add column if not exists avatar_color        text default '#7ecfc0';
alter table profiles add column if not exists avatar_url          text;
alter table profiles add column if not exists banner_url          text;
alter table profiles add column if not exists cp                  integer default 50;
alter table profiles add column if not exists xp                  integer default 0;
alter table profiles add column if not exists level               integer default 1;
alter table profiles add column if not exists rank                text default 'Starter';
alter table profiles add column if not exists league              text default 'Bronze';
alter table profiles add column if not exists reputation          numeric(3,1) default 5.0;
alter table profiles add column if not exists streak              integer default 0;
alter table profiles add column if not exists last_login          date;
alter table profiles add column if not exists badges              text[] default '{}';
alter table profiles add column if not exists plan                text default 'free';
alter table profiles add column if not exists username            text unique;
alter table profiles add column if not exists referral_code       text unique;
alter table profiles add column if not exists referred_by         uuid references profiles(id);
alter table profiles add column if not exists onboarding_completed boolean default false;
alter table profiles add column if not exists is_admin            boolean default false;
alter table profiles add column if not exists is_active           boolean default true;
alter table profiles add column if not exists is_subscribed       boolean default false;
alter table profiles add column if not exists stripe_customer_id  text;
alter table profiles add column if not exists sales_channel       text default 'etsy';
alter table profiles add column if not exists cercle_id           uuid;
alter table profiles add column if not exists website             text;
alter table profiles add column if not exists instagram           text;
alter table profiles add column if not exists facebook            text;
alter table profiles add column if not exists snapchat            text;
alter table profiles add column if not exists tiktok              text;
alter table profiles add column if not exists youtube             text;
alter table profiles add column if not exists pinterest           text;
alter table profiles add column if not exists twitter             text;
alter table profiles add column if not exists etsy_url            text;
alter table profiles add column if not exists shopify_url         text;

-- ════════════════════════════════════════════════════════════════════════════
-- 2) POSTS
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists posts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  product         text not null,
  price           text,
  story           text not null,
  ask             text,
  tags            text[],
  score           integer default 0,
  post_type       text default 'promotion',
  image_url       text,
  link_url        text,
  likes_count     integer default 0,
  favorites_count integer default 0,
  shares_count    integer default 0,
  reviews_count   integer default 0,
  buys_count      integer default 0,
  comments_count  integer default 0,
  is_boosted      boolean default false,
  boosted_until   timestamptz,
  created_at      timestamptz default now()
);

alter table posts add column if not exists tags            text[];
alter table posts add column if not exists post_type       text default 'promotion';
alter table posts add column if not exists image_url       text;
alter table posts add column if not exists link_url        text;
alter table posts add column if not exists comments_count  integer default 0;
alter table posts add column if not exists is_boosted      boolean default false;
alter table posts add column if not exists boosted_until   timestamptz;

-- ════════════════════════════════════════════════════════════════════════════
-- 3) MISSIONS (+ preuve)
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists missions (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid references posts(id) on delete cascade,
  user_id      uuid references profiles(id) on delete cascade,
  mission_type text not null,   -- fav, visit, like, comment, share, pin, review, cart, buy
  cp_earned    integer not null,
  proof_url    text,
  created_at   timestamptz default now(),
  unique(post_id, user_id, mission_type)
);
alter table missions add column if not exists proof_url text;

-- ════════════════════════════════════════════════════════════════════════════
-- 4) INTERACTIONS : likes, favoris, commentaires
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists post_likes (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references posts(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

create table if not exists post_favorites (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references posts(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references posts(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  content    text not null,
  is_useful  boolean,
  created_at timestamptz default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- 5) ÉCONOMIE : historique points, coffre quotidien
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists points_history (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  amount     integer not null,
  type       text not null,     -- earned | spent
  reason     text not null,
  created_at timestamptz default now()
);

create table if not exists daily_chest (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id) on delete cascade,
  opened_at     date default current_date,
  reward_points integer not null,
  unique(user_id, opened_at)
);

-- ════════════════════════════════════════════════════════════════════════════
-- 6) QUÊTES
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists quests (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  description       text,
  requirement_type  text not null,
  requirement_value integer not null,
  reward_points     integer not null,
  reward_xp         integer not null,
  badge_name        text,
  created_at        timestamptz default now()
);

create table if not exists user_quests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade,
  quest_id     uuid references quests(id),
  progress     integer default 0,
  completed    boolean default false,
  completed_at timestamptz,
  unique(user_id, quest_id)
);

-- ════════════════════════════════════════════════════════════════════════════
-- 7) NOTIFICATIONS
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  type       text not null,
  message    text not null,
  post_id    uuid references posts(id) on delete cascade,
  is_read    boolean default false,
  created_at timestamptz default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- 8) COLLABORATIONS & AVIS DE MISSION
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists collaborations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  type        text not null,
  title       text not null,
  description text,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

create table if not exists mission_ratings (
  id         uuid primary key default gen_random_uuid(),
  mission_id uuid references missions(id) on delete cascade,
  rater_id   uuid references profiles(id),
  rated_id   uuid references profiles(id),
  is_useful  boolean not null,
  created_at timestamptz default now(),
  unique(mission_id, rater_id)
);

-- ════════════════════════════════════════════════════════════════════════════
-- 9) CONFIRMATIONS D'ACHAT  (⚠️ table qui MANQUAIT — utilisée par BuyMissionModal)
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists purchase_confirmations (
  id              uuid primary key default gen_random_uuid(),
  post_id         uuid references posts(id) on delete cascade,
  buyer_id        uuid references profiles(id) on delete cascade,
  seller_id       uuid references profiles(id) on delete cascade,
  order_ref       text not null,
  proof_image_url text,
  status          text default 'pending',   -- pending | confirmed | rejected
  confirmed_at    timestamptz,
  created_at      timestamptz default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- 10) PROJETS (financement participatif)
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists projects (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id) on delete cascade,
  title         text not null,
  story         text,
  image_url     text,
  category      text,
  goal_amount   numeric(12,2) not null default 0,
  raised_amount numeric(12,2) not null default 0,
  currency      text default 'EUR',
  deadline      date,
  status        text default 'active',     -- active | funded | closed
  backers_count integer default 0,
  created_at    timestamptz default now()
);

create table if not exists project_tiers (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references projects(id) on delete cascade,
  title         text not null,
  description   text,
  amount        numeric(12,2) not null,
  reward        text,
  max_backers   integer,
  backers_count integer default 0,
  sort_order    integer default 0,
  created_at    timestamptz default now()
);

create table if not exists project_contributions (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references projects(id) on delete cascade,
  user_id       uuid references profiles(id) on delete set null,
  tier_id       uuid references project_tiers(id) on delete set null,
  amount        numeric(12,2) not null,
  message       text,
  is_anonymous  boolean default false,
  status        text default 'pending',    -- pending | paid | refunded
  created_at    timestamptz default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- 10b) CERCLES (groupes d'entraide — gérés par l'admin)
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists cercles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  niche       text,
  max_members integer default 10,
  created_at  timestamptz default now()
);
alter table cercles enable row level security;
drop policy if exists "cercles_select" on cercles;
create policy "cercles_select" on cercles for select using (true);
drop policy if exists "cercles_insert" on cercles;
create policy "cercles_insert" on cercles for insert
  with check (coalesce((select is_admin from profiles where id = auth.uid()), false));
drop policy if exists "cercles_delete" on cercles;
create policy "cercles_delete" on cercles for delete
  using (coalesce((select is_admin from profiles where id = auth.uid()), false));

-- ════════════════════════════════════════════════════════════════════════════
-- 11) FONCTIONS
-- ════════════════════════════════════════════════════════════════════════════

-- Crédit de points + recalcul niveau/ligue + historique
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
  insert into points_history(user_id, amount, type, reason)
    values(p_user_id, p_points, 'earned', p_reason);
  update profiles set is_active = (v_new_cp > 0) where id = p_user_id;

  return jsonb_build_object('cp', v_new_cp, 'xp', v_new_xp, 'level', v_new_level, 'league', v_new_league);
end; $$ language plpgsql security definer;

-- Dépense de points (refuse si solde insuffisant)
create or replace function spend_points(p_user_id uuid, p_points integer, p_reason text)
returns boolean as $$
declare v_cp integer;
begin
  select cp into v_cp from profiles where id = p_user_id;
  if v_cp < p_points then return false; end if;
  update profiles set cp = cp - p_points where id = p_user_id;
  insert into points_history(user_id, amount, type, reason) values(p_user_id, p_points, 'spent', p_reason);
  return true;
end; $$ language plpgsql security definer;

-- Coffre quotidien (1/jour)
create or replace function open_daily_chest(p_user_id uuid)
returns integer as $$
declare v_reward integer; v_rand float; v_already boolean;
begin
  select exists(select 1 from daily_chest where user_id = p_user_id and opened_at = current_date) into v_already;
  if v_already then return -1; end if;
  v_rand := random();
  v_reward := case
    when v_rand >= 0.99 then 500 when v_rand >= 0.95 then 100
    when v_rand >= 0.85 then 50  when v_rand >= 0.60 then 20 else 10 end;
  insert into daily_chest(user_id, opened_at, reward_points) values(p_user_id, current_date, v_reward);
  perform add_points(p_user_id, v_reward, v_reward / 2, 'Coffre quotidien');
  return v_reward;
end; $$ language plpgsql security definer;

-- Série de connexion quotidienne
create or replace function update_daily_streak(p_user_id uuid)
returns integer as $$
declare v_last date; v_streak integer; v_bonus integer := 0;
begin
  select last_login, streak into v_last, v_streak from profiles where id = p_user_id;
  if v_last = current_date then return v_streak; end if;
  if v_last = current_date - 1 then v_streak := coalesce(v_streak,0) + 1; else v_streak := 1; end if;
  v_bonus := case when v_streak = 100 then 500 when v_streak = 30 then 150
                  when v_streak = 7 then 40 when v_streak = 3 then 15 else 0 end;
  update profiles set streak = v_streak, last_login = current_date where id = p_user_id;
  if v_bonus > 0 then perform add_points(p_user_id, v_bonus, v_bonus, 'Bonus série ' || v_streak || ' jours'); end if;
  return v_streak;
end; $$ language plpgsql security definer;

-- Code de parrainage
create or replace function generate_referral_code(p_user_id uuid)
returns text as $$
declare v_code text;
begin
  v_code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  update profiles set referral_code = v_code where id = p_user_id;
  return v_code;
end; $$ language plpgsql security definer;

-- Compteurs de posts
create or replace function increment_comments_count(p_post_id uuid)
returns void as $$ begin update posts set comments_count = comments_count + 1 where id = p_post_id; end; $$ language plpgsql;

create or replace function increment_post_likes(post_id uuid)
returns void as $$ begin update posts set likes_count = likes_count + 1 where id = post_id; end; $$ language plpgsql;

create or replace function decrement_post_likes(post_id uuid)
returns void as $$ begin update posts set likes_count = greatest(0, likes_count - 1) where id = post_id; end; $$ language plpgsql;

create or replace function increment_post_stat(post_id uuid, stat_name text)
returns void as $$
begin
  execute format('update posts set %I = %I + 1 where id = $1', stat_name||'_count', stat_name||'_count') using post_id;
end; $$ language plpgsql;

-- Progression des quêtes
create or replace function update_quest_progress(
  p_user_id uuid, p_requirement_type text, p_increment integer default 1
) returns void as $$
declare v_quest record; v_uq record;
begin
  for v_quest in select * from quests where requirement_type = p_requirement_type loop
    insert into user_quests(user_id, quest_id, progress)
      values(p_user_id, v_quest.id, p_increment)
      on conflict(user_id, quest_id) do update set progress = user_quests.progress + p_increment;
    select * into v_uq from user_quests where user_id = p_user_id and quest_id = v_quest.id;
    if v_uq.progress >= v_quest.requirement_value and not v_uq.completed then
      update user_quests set completed = true, completed_at = now()
        where user_id = p_user_id and quest_id = v_quest.id;
      perform add_points(p_user_id, v_quest.reward_points, v_quest.reward_xp, 'Quête complétée : ' || v_quest.title);
      if v_quest.badge_name is not null then
        update profiles set badges = array_append(badges, v_quest.badge_name)
          where id = p_user_id and not (badges @> array[v_quest.badge_name]);
      end if;
    end if;
  end loop;
end; $$ language plpgsql security definer;

-- Contribution confirmée (appelée par webhook Stripe plus tard / stub actuel)
create or replace function confirm_contribution(p_contribution_id uuid)
returns void as $$
declare c project_contributions%rowtype;
begin
  select * into c from project_contributions where id = p_contribution_id;
  if not found or c.status = 'paid' then return; end if;
  update project_contributions set status = 'paid' where id = p_contribution_id;
  update projects
    set raised_amount = raised_amount + c.amount,
        backers_count = backers_count + 1,
        status = case when raised_amount + c.amount >= goal_amount then 'funded' else status end
    where id = c.project_id;
  if c.tier_id is not null then
    update project_tiers set backers_count = backers_count + 1 where id = c.tier_id;
  end if;
end; $$ language plpgsql security definer;

-- ════════════════════════════════════════════════════════════════════════════
-- 12) DONNÉES INITIALES — QUÊTES
-- ════════════════════════════════════════════════════════════════════════════
insert into quests (title, description, requirement_type, requirement_value, reward_points, reward_xp, badge_name)
select * from (values
  ('Entrepreneur Solidaire', 'Réaliser 10 missions pour d''autres membres', 'missions_count', 10, 100, 150, '🤝'),
  ('Lancement Réussi', 'Publier un projet et obtenir 5 commentaires', 'comments_received', 5, 150, 200, '🚀'),
  ('Expert Feedback', 'Donner 20 avis validés comme utiles', 'useful_ratings', 20, 200, 300, '💡'),
  ('Série de Feu', 'Se connecter 7 jours de suite', 'streak_days', 7, 75, 100, '🔥'),
  ('Réseau d''Or', 'Parrainer 3 membres actifs', 'referrals_count', 3, 300, 400, '⭐')
) as v(title, description, requirement_type, requirement_value, reward_points, reward_xp, badge_name)
where not exists (select 1 from quests q where q.title = v.title);

-- ════════════════════════════════════════════════════════════════════════════
-- 13) ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════════════
alter table profiles               enable row level security;
alter table posts                  enable row level security;
alter table missions               enable row level security;
alter table post_likes             enable row level security;
alter table post_favorites         enable row level security;
alter table comments               enable row level security;
alter table points_history         enable row level security;
alter table daily_chest            enable row level security;
alter table quests                 enable row level security;
alter table user_quests            enable row level security;
alter table notifications          enable row level security;
alter table collaborations         enable row level security;
alter table mission_ratings        enable row level security;
alter table purchase_confirmations enable row level security;
alter table projects               enable row level security;
alter table project_tiers          enable row level security;
alter table project_contributions  enable row level security;

-- PROFILES  (⚠️ update trop large — à restreindre en P1)
drop policy if exists "profiles_select" on profiles;
create policy "profiles_select" on profiles for select using (true);
drop policy if exists "profiles_insert" on profiles;
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update" on profiles;
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- POSTS
drop policy if exists "posts_select" on posts;
create policy "posts_select" on posts for select using (true);
drop policy if exists "posts_insert" on posts;
create policy "posts_insert" on posts for insert with check (auth.uid() = user_id);
drop policy if exists "posts_update" on posts;
create policy "posts_update" on posts for update using (auth.uid() = user_id);
drop policy if exists "posts_delete" on posts;
create policy "posts_delete" on posts for delete using (auth.uid() = user_id);

-- MISSIONS
drop policy if exists "missions_select" on missions;
create policy "missions_select" on missions for select using (true);
drop policy if exists "missions_insert" on missions;
create policy "missions_insert" on missions for insert with check (auth.uid() = user_id);

-- LIKES / FAVORIS
drop policy if exists "likes_select" on post_likes;
create policy "likes_select" on post_likes for select using (true);
drop policy if exists "likes_insert" on post_likes;
create policy "likes_insert" on post_likes for insert with check (auth.uid() = user_id);
drop policy if exists "likes_delete" on post_likes;
create policy "likes_delete" on post_likes for delete using (auth.uid() = user_id);

drop policy if exists "fav_select" on post_favorites;
create policy "fav_select" on post_favorites for select using (true);
drop policy if exists "fav_insert" on post_favorites;
create policy "fav_insert" on post_favorites for insert with check (auth.uid() = user_id);
drop policy if exists "fav_delete" on post_favorites;
create policy "fav_delete" on post_favorites for delete using (auth.uid() = user_id);

-- COMMENTS
drop policy if exists "comments_select" on comments;
create policy "comments_select" on comments for select using (true);
drop policy if exists "comments_insert" on comments;
create policy "comments_insert" on comments for insert with check (auth.uid() = user_id);

-- POINTS HISTORY  (lecture perso ; insert perso pour le crédit de bienvenue côté client)
drop policy if exists "ph_select" on points_history;
create policy "ph_select" on points_history for select using (auth.uid() = user_id);
drop policy if exists "ph_insert" on points_history;
create policy "ph_insert" on points_history for insert with check (auth.uid() = user_id);

-- DAILY CHEST
drop policy if exists "chest_select" on daily_chest;
create policy "chest_select" on daily_chest for select using (auth.uid() = user_id);

-- QUESTS
drop policy if exists "quests_select" on quests;
create policy "quests_select" on quests for select using (true);

-- USER QUESTS  (lecture + insert perso lors de l'inscription)
drop policy if exists "uq_select" on user_quests;
create policy "uq_select" on user_quests for select using (auth.uid() = user_id);
drop policy if exists "uq_insert" on user_quests;
create policy "uq_insert" on user_quests for insert with check (auth.uid() = user_id);

-- NOTIFICATIONS  (chacun lit/modifie les siennes ; tout membre connecté peut en créer
--   pour autrui — nécessaire pour notifier un vendeur/un auteur de post)
drop policy if exists "notif_select" on notifications;
create policy "notif_select" on notifications for select using (auth.uid() = user_id);
drop policy if exists "notif_insert" on notifications;
create policy "notif_insert" on notifications for insert with check (auth.uid() is not null);
drop policy if exists "notif_update" on notifications;
create policy "notif_update" on notifications for update using (auth.uid() = user_id);

-- COLLABORATIONS
drop policy if exists "collab_select" on collaborations;
create policy "collab_select" on collaborations for select using (true);
drop policy if exists "collab_insert" on collaborations;
create policy "collab_insert" on collaborations for insert with check (auth.uid() = user_id);

-- MISSION RATINGS
drop policy if exists "mr_select" on mission_ratings;
create policy "mr_select" on mission_ratings for select using (true);
drop policy if exists "mr_insert" on mission_ratings;
create policy "mr_insert" on mission_ratings for insert with check (auth.uid() = rater_id);

-- PURCHASE CONFIRMATIONS  (acheteur crée ; acheteur+vendeur lisent ; vendeur valide)
drop policy if exists "pc_select" on purchase_confirmations;
create policy "pc_select" on purchase_confirmations for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
drop policy if exists "pc_insert" on purchase_confirmations;
create policy "pc_insert" on purchase_confirmations for insert with check (auth.uid() = buyer_id);
drop policy if exists "pc_update" on purchase_confirmations;
create policy "pc_update" on purchase_confirmations for update using (auth.uid() = seller_id);

-- PROJECTS
drop policy if exists "proj_select" on projects;
create policy "proj_select" on projects for select using (true);
drop policy if exists "proj_insert" on projects;
create policy "proj_insert" on projects for insert with check (auth.uid() = user_id);
drop policy if exists "proj_update" on projects;
create policy "proj_update" on projects for update using (auth.uid() = user_id);
drop policy if exists "proj_delete" on projects;
create policy "proj_delete" on projects for delete using (auth.uid() = user_id);

-- PROJECT TIERS
drop policy if exists "tiers_select" on project_tiers;
create policy "tiers_select" on project_tiers for select using (true);
drop policy if exists "tiers_insert" on project_tiers;
create policy "tiers_insert" on project_tiers for insert with check (
  exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
drop policy if exists "tiers_update" on project_tiers;
create policy "tiers_update" on project_tiers for update using (
  exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
drop policy if exists "tiers_delete" on project_tiers;
create policy "tiers_delete" on project_tiers for delete using (
  exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));

-- PROJECT CONTRIBUTIONS
drop policy if exists "contrib_select" on project_contributions;
create policy "contrib_select" on project_contributions for select using (true);
drop policy if exists "contrib_insert" on project_contributions;
create policy "contrib_insert" on project_contributions for insert with check (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════════════════════
-- 14) STOCKAGE (buckets + policies)  — pour les uploads (logo, bannière, preuves)
-- ════════════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', true),
  ('post-images', 'post-images', true),
  ('banners', 'banners', true)
on conflict (id) do nothing;

drop policy if exists "storage_read_public" on storage.objects;
create policy "storage_read_public" on storage.objects for select
  using (bucket_id in ('avatars','post-images','banners'));

drop policy if exists "storage_insert_auth" on storage.objects;
create policy "storage_insert_auth" on storage.objects for insert to authenticated
  with check (bucket_id in ('avatars','post-images','banners'));

drop policy if exists "storage_update_own" on storage.objects;
create policy "storage_update_own" on storage.objects for update to authenticated
  using (bucket_id in ('avatars','post-images','banners') and owner = auth.uid());

drop policy if exists "storage_delete_own" on storage.objects;
create policy "storage_delete_own" on storage.objects for delete to authenticated
  using (bucket_id in ('avatars','post-images','banners') and owner = auth.uid());

-- ════════════════════════════════════════════════════════════════════════════
-- FIN — CirclUp schema_complet.sql
-- ════════════════════════════════════════════════════════════════════════════
