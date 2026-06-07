-- ════════════════════════════════════════════════════════════
-- Migration : Bannière de profil + réseaux sociaux
-- À exécuter dans Supabase → SQL Editor
-- ════════════════════════════════════════════════════════════

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_url  text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram   text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS facebook    text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS snapchat    text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tiktok      text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS youtube     text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pinterest   text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter     text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS etsy_url    text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shopify_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS goal        text; -- objectif sur CirclUp

-- Bucket de stockage pour les bannières (si pas déjà créé)
-- À faire dans Supabase → Storage : créer un bucket public "banners"
