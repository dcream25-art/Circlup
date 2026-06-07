-- ════════════════════════════════════════════════════════════
-- Feature : PROJETS (financement participatif)
-- À exécuter dans Supabase → SQL Editor
-- Modèle neutre : l'encaissement réel (Stripe) sera branché plus tard.
-- ════════════════════════════════════════════════════════════

-- 1. Projets
create table if not exists projects (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id) on delete cascade,
  title         text not null,
  story         text,
  image_url     text,
  category      text,
  goal_amount   numeric(12,2) not null default 0,   -- objectif en €
  raised_amount numeric(12,2) not null default 0,    -- collecté (confirmé)
  currency      text default 'EUR',
  deadline      date,
  status        text default 'active',               -- active | funded | closed
  backers_count integer default 0,
  created_at    timestamptz default now()
);

-- 2. Paliers de contrepartie
create table if not exists project_tiers (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references projects(id) on delete cascade,
  title         text not null,
  description   text,
  amount        numeric(12,2) not null,              -- montant du palier en €
  reward        text,                                -- contrepartie (avantage/produit)
  max_backers   integer,                             -- limite optionnelle (null = illimité)
  backers_count integer default 0,
  sort_order    integer default 0,
  created_at    timestamptz default now()
);

-- 3. Contributions
create table if not exists project_contributions (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references projects(id) on delete cascade,
  user_id       uuid references profiles(id) on delete set null,
  tier_id       uuid references project_tiers(id) on delete set null,  -- null = don simple
  amount        numeric(12,2) not null,
  message       text,
  is_anonymous  boolean default false,
  status        text default 'pending',              -- pending | paid | refunded (paid posé par le webhook Stripe plus tard)
  created_at    timestamptz default now()
);

-- ── RLS ──
alter table projects             enable row level security;
alter table project_tiers        enable row level security;
alter table project_contributions enable row level security;

-- Projets : lecture publique, écriture par le propriétaire
create policy "projects read"   on projects for select using (true);
create policy "projects insert" on projects for insert with check (auth.uid() = user_id);
create policy "projects update" on projects for update using (auth.uid() = user_id);
create policy "projects delete" on projects for delete using (auth.uid() = user_id);

-- Paliers : lecture publique, écriture par le propriétaire du projet
create policy "tiers read"   on project_tiers for select using (true);
create policy "tiers insert" on project_tiers for insert with check (
  exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid())
);
create policy "tiers update" on project_tiers for update using (
  exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid())
);
create policy "tiers delete" on project_tiers for delete using (
  exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid())
);

-- Contributions : lecture publique (pour la liste des soutiens), insertion par utilisateur connecté
create policy "contrib read"   on project_contributions for select using (true);
create policy "contrib insert" on project_contributions for insert with check (auth.uid() = user_id);

-- ── Fonction : enregistrer une contribution confirmée et mettre à jour les compteurs ──
-- (Appelée par le webhook Stripe plus tard. En mode stub, on l'appelle directement après "paiement simulé".)
create or replace function confirm_contribution(p_contribution_id uuid)
returns void as $$
declare
  c project_contributions%rowtype;
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
end;
$$ language plpgsql security definer;
