-- ============================================================================
-- CIRCLUP — P3 (nettoyage) : table d'inscription newsletter
-- À exécuter dans Supabase > SQL Editor. Idempotent.
-- ============================================================================
create table if not exists newsletter_emails (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  created_at timestamptz default now()
);
alter table newsletter_emails enable row level security;

-- Inscription ouverte à tous (visiteurs non connectés inclus)
drop policy if exists "newsletter_insert" on newsletter_emails;
create policy "newsletter_insert" on newsletter_emails for insert with check (true);
-- Pas de policy SELECT : les emails ne sont lisibles que via le dashboard (service role)
