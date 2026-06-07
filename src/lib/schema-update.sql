-- ============================================================
-- CIRCUP — MISE À JOUR SUPABASE
-- Colle ce SQL dans Supabase > SQL Editor > New Query
-- ============================================================

-- ─────────────────────────────────────────────
-- MISE À JOUR TABLE PROFILES
-- ─────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp integer default 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level integer default 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reputation numeric(3,1) default 5.0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak integer default 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS league text default 'Bronze';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badges text[] default '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan text default 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username text unique;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code text unique;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by uuid references profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean default false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean default false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sales_channel text default 'etsy';

-- ─────────────────────────────────────────────
-- MISE À JOUR TABLE POSTS
-- ─────────────────────────────────────────────
ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_type text default 'promotion';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_count integer default 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_boosted boolean default false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS boosted_until timestamp;

-- ─────────────────────────────────────────────
-- NOUVELLES TABLES
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  content text not null,
  is_useful boolean,
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamp default now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_favorites (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamp default now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS points_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  amount integer not null,
  type text not null,
  reason text not null,
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS daily_chest (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  opened_at date default current_date,
  reward_points integer not null,
  UNIQUE(user_id, opened_at)
);

CREATE TABLE IF NOT EXISTS quests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  requirement_type text not null,
  requirement_value integer not null,
  reward_points integer not null,
  reward_xp integer not null,
  badge_name text,
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS user_quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  quest_id uuid references quests(id),
  progress integer default 0,
  completed boolean default false,
  completed_at timestamp,
  UNIQUE(user_id, quest_id)
);

CREATE TABLE IF NOT EXISTS collaborations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  description text,
  is_active boolean default true,
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS mission_ratings (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references missions(id) on delete cascade,
  rater_id uuid references profiles(id),
  rated_id uuid references profiles(id),
  is_useful boolean not null,
  created_at timestamp default now(),
  UNIQUE(mission_id, rater_id)
);

-- ─────────────────────────────────────────────
-- DONNÉES INITIALES — QUÊTES
-- ─────────────────────────────────────────────
INSERT INTO quests (title, description, requirement_type, requirement_value, reward_points, reward_xp, badge_name) VALUES
('Entrepreneur Solidaire', 'Réaliser 10 missions pour d''autres membres', 'missions_count', 10, 100, 150, '🤝'),
('Lancement Réussi', 'Publier un projet et obtenir 5 commentaires', 'comments_received', 5, 150, 200, '🚀'),
('Expert Feedback', 'Donner 20 avis validés comme utiles', 'useful_ratings', 20, 200, 300, '💡'),
('Série de Feu', 'Se connecter 7 jours de suite', 'streak_days', 7, 75, 100, '🔥'),
('Réseau d''Or', 'Parrainer 3 membres actifs', 'referrals_count', 3, 300, 400, '⭐')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- FONCTIONS SUPABASE
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION add_points(
  p_user_id uuid,
  p_points integer,
  p_xp integer DEFAULT 0,
  p_reason text DEFAULT ''
) RETURNS jsonb AS $$
DECLARE
  v_new_cp integer;
  v_new_xp integer;
  v_new_level integer;
  v_new_league text;
BEGIN
  UPDATE profiles
  SET cp = cp + p_points, xp = xp + p_xp
  WHERE id = p_user_id
  RETURNING cp, xp INTO v_new_cp, v_new_xp;

  v_new_level := CASE
    WHEN v_new_xp >= 10000 THEN 6
    WHEN v_new_xp >= 5000  THEN 5
    WHEN v_new_xp >= 2000  THEN 4
    WHEN v_new_xp >= 750   THEN 3
    WHEN v_new_xp >= 200   THEN 2
    ELSE 1
  END;

  v_new_league := CASE
    WHEN v_new_cp >= 5000 THEN 'Légende'
    WHEN v_new_cp >= 2000 THEN 'Diamant'
    WHEN v_new_cp >= 1000 THEN 'Or'
    WHEN v_new_cp >= 400  THEN 'Argent'
    ELSE 'Bronze'
  END;

  UPDATE profiles SET level = v_new_level, league = v_new_league WHERE id = p_user_id;

  INSERT INTO points_history(user_id, amount, type, reason)
  VALUES(p_user_id, p_points, 'earned', p_reason);

  UPDATE profiles SET is_active = (v_new_cp > 0) WHERE id = p_user_id;

  RETURN jsonb_build_object('cp', v_new_cp, 'xp', v_new_xp, 'level', v_new_level, 'league', v_new_league);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION spend_points(p_user_id uuid, p_points integer, p_reason text)
RETURNS boolean AS $$
DECLARE v_current_cp integer;
BEGIN
  SELECT cp INTO v_current_cp FROM profiles WHERE id = p_user_id;
  IF v_current_cp < p_points THEN RETURN false; END IF;
  UPDATE profiles SET cp = cp - p_points WHERE id = p_user_id;
  INSERT INTO points_history(user_id, amount, type, reason) VALUES(p_user_id, p_points, 'spent', p_reason);
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION open_daily_chest(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  v_reward integer;
  v_rand float;
  v_already_opened boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM daily_chest WHERE user_id = p_user_id AND opened_at = current_date) INTO v_already_opened;
  IF v_already_opened THEN RETURN -1; END IF;
  v_rand := random();
  v_reward := CASE
    WHEN v_rand >= 0.99 THEN 500
    WHEN v_rand >= 0.95 THEN 100
    WHEN v_rand >= 0.85 THEN 50
    WHEN v_rand >= 0.60 THEN 20
    ELSE 10
  END;
  INSERT INTO daily_chest(user_id, opened_at, reward_points) VALUES(p_user_id, current_date, v_reward);
  PERFORM add_points(p_user_id, v_reward, v_reward / 2, 'Coffre quotidien');
  RETURN v_reward;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_daily_streak(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  v_last_login date;
  v_current_streak integer;
  v_bonus_points integer := 0;
BEGIN
  SELECT last_login, streak INTO v_last_login, v_current_streak FROM profiles WHERE id = p_user_id;
  IF v_last_login = current_date THEN RETURN v_current_streak; END IF;
  IF v_last_login = current_date - 1 THEN
    v_current_streak := v_current_streak + 1;
  ELSE
    v_current_streak := 1;
  END IF;
  v_bonus_points := CASE
    WHEN v_current_streak = 100 THEN 500
    WHEN v_current_streak = 30  THEN 150
    WHEN v_current_streak = 7   THEN 40
    WHEN v_current_streak = 3   THEN 15
    ELSE 0
  END;
  UPDATE profiles SET streak = v_current_streak, last_login = current_date WHERE id = p_user_id;
  IF v_bonus_points > 0 THEN
    PERFORM add_points(p_user_id, v_bonus_points, v_bonus_points, 'Bonus série ' || v_current_streak || ' jours');
  END IF;
  RETURN v_current_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id uuid)
RETURNS text AS $$
DECLARE v_code text;
BEGIN
  v_code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  UPDATE profiles SET referral_code = v_code WHERE id = p_user_id;
  RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_comments_count(p_post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE posts SET comments_count = comments_count + 1 WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_quest_progress(
  p_user_id uuid, p_requirement_type text, p_increment integer DEFAULT 1
) RETURNS void AS $$
DECLARE
  v_quest RECORD;
  v_user_quest RECORD;
BEGIN
  FOR v_quest IN SELECT * FROM quests WHERE requirement_type = p_requirement_type LOOP
    INSERT INTO user_quests(user_id, quest_id, progress)
    VALUES(p_user_id, v_quest.id, p_increment)
    ON CONFLICT(user_id, quest_id) DO UPDATE SET progress = user_quests.progress + p_increment;

    SELECT * INTO v_user_quest FROM user_quests WHERE user_id = p_user_id AND quest_id = v_quest.id;

    IF v_user_quest.progress >= v_quest.requirement_value AND NOT v_user_quest.completed THEN
      UPDATE user_quests SET completed = true, completed_at = now()
      WHERE user_id = p_user_id AND quest_id = v_quest.id;
      PERFORM add_points(p_user_id, v_quest.reward_points, v_quest.reward_xp, 'Quête complétée : ' || v_quest.title);
      IF v_quest.badge_name IS NOT NULL THEN
        UPDATE profiles SET badges = array_append(badges, v_quest.badge_name)
        WHERE id = p_user_id AND NOT (badges @> ARRAY[v_quest.badge_name]);
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_chest ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Commentaires lisibles par tous" ON comments FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Commentaires créables par membres" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Likes lisibles par tous" ON post_likes FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Likes créables" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Likes supprimables" ON post_likes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Favoris lisibles" ON post_favorites FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Favoris créables" ON post_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Favoris supprimables" ON post_favorites FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Historique points perso" ON points_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Coffre perso" ON daily_chest FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Quêtes lisibles" ON user_quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Collabs lisibles par tous" ON collaborations FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Collabs créables" ON collaborations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permettre à profiles d'être inséré par l'utilisateur lui-même
CREATE POLICY IF NOT EXISTS "Profil insérable par son owner" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
