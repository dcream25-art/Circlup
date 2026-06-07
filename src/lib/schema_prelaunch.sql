-- ============================================================================
-- CIRCLUP — PRÉ-LANCEMENT : waitlist virale (parrainage + file d'attente)
-- À exécuter dans Supabase > SQL Editor APRÈS les schémas précédents. Idempotent.
--
-- Sécurité (dans la lignée du P1) : AUCUN accès direct client à la table.
-- Tout passe par des fonctions SECURITY DEFINER. Les emails ne sont JAMAIS
-- lisibles par le client (anon/authenticated) — seuls la position, le total et
-- le compteur de parrainage de SA propre inscription sont exposés.
-- ============================================================================

create table if not exists waitlist (
  id             uuid primary key default gen_random_uuid(),
  email          text not null unique,
  referral_code  text not null unique,
  referred_by    text,                          -- referral_code du parrain (nullable)
  referral_count int  not null default 0,       -- nb de filleuls inscrits (serveur uniquement)
  created_at     timestamptz default now()
);

alter table waitlist enable row level security;
-- Pas de policy : on bloque tout accès direct. Les RPC ci-dessous (owner) bypassent la RLS.
drop policy if exists "waitlist_no_direct" on waitlist;

-- Index pour le calcul de rang (referral_count desc, created_at asc)
create index if not exists waitlist_rank_idx on waitlist (referral_count desc, created_at asc);

-- ----------------------------------------------------------------------------
-- join_waitlist : inscrit un email, crédite le parrain, renvoie code + position.
-- Idempotent : re-soumettre le même email renvoie son code/position existants.
-- ----------------------------------------------------------------------------
create or replace function join_waitlist(p_email text, p_ref text default null)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email     text := lower(trim(p_email));
  v_ref       text := nullif(upper(trim(p_ref)), '');
  v_existing  waitlist%rowtype;
  v_code      text;
  v_position  int;
  v_total     int;
  v_ref_count int;
begin
  -- Validation email (regex simple)
  if v_email is null or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    return json_build_object('error', 'invalid_email');
  end if;

  -- Déjà inscrit ? → retour idempotent (pas de double crédit parrain)
  select * into v_existing from waitlist where email = v_email;

  if found then
    v_code      := v_existing.referral_code;
    v_ref_count := v_existing.referral_count;
  else
    -- Code de parrainage unique (8 hex majuscules)
    loop
      v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
      exit when not exists (select 1 from waitlist where referral_code = v_code);
    end loop;

    -- Le parrain doit exister, sinon on ignore (pas d'auto-parrainage possible : code frais)
    if v_ref is not null and not exists (select 1 from waitlist where referral_code = v_ref) then
      v_ref := null;
    end if;

    insert into waitlist (email, referral_code, referred_by)
    values (v_email, v_code, v_ref);

    if v_ref is not null then
      update waitlist set referral_count = referral_count + 1 where referral_code = v_ref;
    end if;

    v_ref_count := 0;
  end if;

  -- Position = nb de personnes strictement devant + 1
  select count(*) + 1 into v_position
  from waitlist w
  join waitlist me on me.email = v_email
  where w.referral_count > me.referral_count
     or (w.referral_count = me.referral_count and w.created_at < me.created_at);

  select count(*) into v_total from waitlist;

  return json_build_object(
    'code', v_code,
    'position', v_position,
    'total', v_total,
    'referral_count', v_ref_count
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- get_waitlist_status : récupère position/total/parrainage à partir d'un code
-- (utilisé au retour d'un visiteur via localStorage). N'expose aucun email.
-- ----------------------------------------------------------------------------
create or replace function get_waitlist_status(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  me         waitlist%rowtype;
  v_position int;
  v_total    int;
begin
  select * into me from waitlist where referral_code = upper(trim(p_code));
  if not found then
    return json_build_object('error', 'not_found');
  end if;

  select count(*) + 1 into v_position
  from waitlist w
  where w.referral_count > me.referral_count
     or (w.referral_count = me.referral_count and w.created_at < me.created_at);

  select count(*) into v_total from waitlist;

  return json_build_object(
    'code', me.referral_code,
    'position', v_position,
    'total', v_total,
    'referral_count', me.referral_count
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- waitlist_count : compteur public (social proof), sans fuite d'emails.
-- ----------------------------------------------------------------------------
create or replace function waitlist_count()
returns int
language sql
security definer
set search_path = public
as $$
  select count(*)::int from waitlist;
$$;

-- Permissions : exécution ouverte aux visiteurs, accès table interdit
revoke all on function join_waitlist(text, text)   from public;
revoke all on function get_waitlist_status(text)    from public;
revoke all on function waitlist_count()             from public;
grant execute on function join_waitlist(text, text) to anon, authenticated;
grant execute on function get_waitlist_status(text) to anon, authenticated;
grant execute on function waitlist_count()          to anon, authenticated;

-- ============================================================================
-- AU LANCEMENT (rappel, non automatisé ici) :
--   • Exporter les emails : select email, referral_count, created_at from waitlist
--     order by referral_count desc, created_at asc;  (via SQL Editor / service_role)
--   • Les 200 premiers (référence : badge Fondateur, 200 ex.) → is_founder + bonus CP,
--     à accorder à l'inscription réelle (matching email) côté serveur. Voir roadmap P-LAUNCH.
-- ============================================================================
