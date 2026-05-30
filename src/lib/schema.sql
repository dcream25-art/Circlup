-- ============================================================
-- CIRCLUP — SCHEMA SUPABASE
-- Colle ce SQL dans Supabase > SQL Editor > New Query
-- ============================================================

-- 1. PROFILES (membres)
create table profiles (
  id            uuid references auth.users primary key,
  email         text unique not null,
  name          text not null,
  shop_name     text not null,
  shop_url      text not null,
  niche         text,
  bio           text,
  avatar_color  text default '#7ecfc0',
  cp            integer default 20,
  rank          text default 'Starter',
  cercle_id     uuid,
  is_active     boolean default true,
  is_subscribed boolean default false,
  stripe_customer_id text,
  created_at    timestamp default now()
);

-- 2. POSTS
create table posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  product     text not null,
  price       text,
  story       text not null,
  ask         text,
  tags        text[],
  score       integer default 0,
  likes_count    integer default 0,
  favorites_count integer default 0,
  shares_count   integer default 0,
  reviews_count  integer default 0,
  buys_count     integer default 0,
  created_at  timestamp default now()
);

-- 3. MISSIONS (actions faites par les membres)
create table missions (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid references posts(id) on delete cascade,
  user_id      uuid references profiles(id) on delete cascade,
  mission_type text not null, -- fav, visit, like, comment, share, pin, review, buy
  cp_earned    integer not null,
  created_at   timestamp default now(),
  unique(post_id, user_id, mission_type) -- 1 mission par type par personne par post
);

-- 4. LIKES
create table likes (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references posts(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  created_at timestamp default now(),
  unique(post_id, user_id)
);

-- 5. CERCLES
create table cercles (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  niche      text,
  max_members integer default 10,
  created_at timestamp default now()
);

-- 6. NOTIFICATIONS
create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  type       text not null,
  message    text not null,
  post_id    uuid references posts(id),
  is_read    boolean default false,
  created_at timestamp default now()
);

-- 7. CP HISTORY (historique des crédits)
create table cp_history (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  amount     integer not null,
  reason     text not null,
  created_at timestamp default now()
);

-- ============================================================
-- FONCTIONS & TRIGGERS
-- ============================================================

-- Fonction pour ajouter des CP
create or replace function add_cp(user_id uuid, amount integer, reason text)
returns void as $$
begin
  update profiles set cp = cp + amount where id = user_id;
  insert into cp_history(user_id, amount, reason) values(user_id, amount, reason);
  -- Met à jour le rang automatiquement
  update profiles set rank = case
    when cp >= 700 then 'Leader'
    when cp >= 300 then 'Booster'
    when cp >= 100 then 'Builder'
    else 'Starter'
  end where id = user_id;
end;
$$ language plpgsql;

-- Fonction pour incrémenter les stats d'un post
create or replace function increment_post_stat(post_id uuid, stat_name text)
returns void as $$
begin
  execute format('update posts set %I = %I + 1 where id = $1', stat_name||'_count', stat_name||'_count') using post_id;
end;
$$ language plpgsql;

-- Fonction pour incrémenter les likes
create or replace function increment_post_likes(post_id uuid)
returns void as $$
begin
  update posts set likes_count = likes_count + 1 where id = post_id;
end;
$$ language plpgsql;

-- Fonction pour décrémenter les likes
create or replace function decrement_post_likes(post_id uuid)
returns void as $$
begin
  update posts set likes_count = likes_count - 1 where id = post_id;
end;
$$ language plpgsql;

-- ============================================================
-- SÉCURITÉ (Row Level Security)
-- ============================================================

alter table profiles      enable row level security;
alter table posts         enable row level security;
alter table missions      enable row level security;
alter table likes         enable row level security;
alter table notifications enable row level security;
alter table cp_history    enable row level security;

-- Profiles : tout le monde peut lire, chacun modifie le sien
create policy "Profiles lisibles par tous" on profiles for select using (true);
create policy "Profil modifiable par son owner" on profiles for update using (auth.uid() = id);

-- Posts : tout le monde peut lire, chacun crée/modifie les siens
create policy "Posts lisibles par tous" on posts for select using (true);
create policy "Posts créables par membres" on posts for insert with check (auth.uid() = user_id);
create policy "Posts modifiables par leur owner" on posts for update using (auth.uid() = user_id);

-- Missions : lecture publique, création par membres connectés
create policy "Missions lisibles par tous" on missions for select using (true);
create policy "Missions créables par membres" on missions for insert with check (auth.uid() = user_id);

-- Notifications : chacun voit les siennes
create policy "Notifs perso" on notifications for select using (auth.uid() = user_id);
create policy "Notifs update" on notifications for update using (auth.uid() = user_id);

-- CP History : chacun voit le sien
create policy "CP history perso" on cp_history for select using (auth.uid() = user_id);
