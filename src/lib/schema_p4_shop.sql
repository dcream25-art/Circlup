-- ============================================================================
-- CIRCLUP — P4 (Phase 1) : BOUTIQUE CP — IDENTITÉ & STATUT (purs puits)
-- ----------------------------------------------------------------------------
-- À exécuter après les migrations précédentes. Idempotent.
-- Ces achats ne font que DÉPENSER des CP (aucune frappe) → zéro risque d'inflation.
-- Raretés : couleur de pseudo (50 max), badge Fondateur (200 max).
-- ============================================================================

-- 1) Colonnes cosmétiques
alter table profiles add column if not exists rank_badge        text;     -- 'Pionnier' | 'Elite Seller' | 'Top Contributor'
alter table profiles add column if not exists profile_frame     text;     -- 'animated' | null
alter table profiles add column if not exists is_verified_badge boolean default false;
alter table profiles add column if not exists pseudo_color       text;     -- couleur hex du pseudo
alter table profiles add column if not exists is_founder         boolean default false;

-- 2) Dépense interne sécurisée (révoquée du client)
create or replace function _spend_cp(p_uid uuid, p_cost integer, p_reason text)
returns boolean as $$
declare v_cp integer;
begin
  if p_uid is null or p_cost is null or p_cost <= 0 then return false; end if;
  select cp into v_cp from profiles where id = p_uid;
  if v_cp is null or v_cp < p_cost then return false; end if;
  update profiles set cp = cp - p_cost where id = p_uid;
  insert into points_history(user_id, amount, type, reason) values(p_uid, p_cost, 'spent', p_reason);
  return true;
end; $$ language plpgsql security definer;
revoke execute on function _spend_cp(uuid, integer, text) from public, anon, authenticated;

-- 3) Achats (SECURITY DEFINER, contrôlent solde + rareté côté serveur)

create or replace function buy_rank_badge(p_badge text)
returns boolean as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null or p_badge not in ('Pionnier','Elite Seller','Top Contributor') then return false; end if;
  if not _spend_cp(v_uid, 300, 'Badge de rang : ' || p_badge) then return false; end if;
  update profiles set rank_badge = p_badge where id = v_uid;
  return true;
end; $$ language plpgsql security definer;

create or replace function buy_profile_frame()
returns boolean as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then return false; end if;
  if coalesce((select profile_frame from profiles where id = v_uid), '') = 'animated' then return false; end if;
  if not _spend_cp(v_uid, 120, 'Cadre de profil animé') then return false; end if;
  update profiles set profile_frame = 'animated' where id = v_uid;
  return true;
end; $$ language plpgsql security definer;

create or replace function buy_verified_tag()
returns boolean as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then return false; end if;
  if coalesce((select is_verified_badge from profiles where id = v_uid), false) then return false; end if;
  if not _spend_cp(v_uid, 250, 'Tag Vérifié') then return false; end if;
  update profiles set is_verified_badge = true where id = v_uid;
  return true;
end; $$ language plpgsql security definer;

create or replace function buy_pseudo_color(p_color text)
returns boolean as $$
declare v_uid uuid := auth.uid(); v_count integer;
begin
  if v_uid is null or p_color is null or p_color !~ '^#[0-9A-Fa-f]{6}$' then return false; end if;
  -- rareté : 50 membres max possèdent une couleur
  select count(*) into v_count from profiles where pseudo_color is not null and id <> v_uid;
  if v_count >= 50 then return false; end if;
  if not _spend_cp(v_uid, 400, 'Couleur de pseudo') then return false; end if;
  update profiles set pseudo_color = p_color where id = v_uid;
  return true;
end; $$ language plpgsql security definer;

create or replace function buy_founder_badge()
returns boolean as $$
declare v_uid uuid := auth.uid(); v_count integer;
begin
  if v_uid is null then return false; end if;
  if coalesce((select is_founder from profiles where id = v_uid), false) then return false; end if;
  select count(*) into v_count from profiles where is_founder = true;
  if v_count >= 200 then return false; end if;  -- édition limitée 200 ex.
  if not _spend_cp(v_uid, 500, 'Badge Fondateur CirclUp') then return false; end if;
  update profiles set is_founder = true where id = v_uid;
  return true;
end; $$ language plpgsql security definer;

-- ════════════════════════════════════════════════════════════════════════════
-- FIN — CirclUp schema_p4_shop.sql (Phase 1 : identité & statut)
-- ════════════════════════════════════════════════════════════════════════════
