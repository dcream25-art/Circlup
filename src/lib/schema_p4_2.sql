-- ============================================================================
-- CIRCLUP — P4 (Phase 2) : BOOST RARE « TÊTE DE FEED » (1 slot/jour, pur puits)
-- ----------------------------------------------------------------------------
-- À exécuter après schema_p4_shop.sql. Idempotent.
-- Rareté stricte : 1 seul post peut être en tête de feed à la fois sur TOUTE
-- la plateforme (le slot dure 24h → ≈ 1 par jour). Crée tension + valeur.
-- ============================================================================

alter table posts add column if not exists top_until timestamptz;

-- Achat de la tête de feed (150 CP). Retourne un statut texte.
create or replace function buy_feed_top(p_post_id uuid)
returns text as $$
declare v_uid uuid := auth.uid(); v_owner uuid; v_taken integer;
begin
  if v_uid is null then return 'not_owner'; end if;
  select user_id into v_owner from posts where id = p_post_id;
  if v_owner is null or v_owner <> v_uid then return 'not_owner'; end if;

  -- rareté : un seul slot actif à la fois sur toute la plateforme
  select count(*) into v_taken from posts where top_until is not null and top_until > now();
  if v_taken >= 1 then return 'slot_taken'; end if;

  if not _spend_cp(v_uid, 150, 'Tête de feed 24h') then return 'insufficient'; end if;

  update posts
    set top_until = now() + interval '24 hours',
        is_boosted = true,
        boosted_until = greatest(coalesce(boosted_until, now()), now() + interval '24 hours')
    where id = p_post_id;
  return 'ok';
end; $$ language plpgsql security definer;

-- ════════════════════════════════════════════════════════════════════════════
-- FIN — CirclUp schema_p4_2.sql (Phase 2 : tête de feed)
-- ════════════════════════════════════════════════════════════════════════════
