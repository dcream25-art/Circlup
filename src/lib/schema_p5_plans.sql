-- ============================================================================
-- CIRCLUP — P5 : LIMITES DE PLAN CÔTÉ SERVEUR (posts par plan)
-- ----------------------------------------------------------------------------
-- À exécuter après schema_p4_3_4.sql. Idempotent.
-- Rend le plan "Starter" RÉEL : limite de posts par plan, imposée au serveur.
--   free = 2 · starter = 10 · premium = illimité
-- (La limite de missions/jour par plan est dans le trigger missions : 5/20/30.)
-- ============================================================================

create or replace function _posts_before_insert_limit() returns trigger as $$
declare v_plan text; v_limit integer; v_count integer;
begin
  if current_user not in ('postgres', 'service_role', 'supabase_admin') then
    select coalesce(plan, 'free') into v_plan from profiles where id = new.user_id;
    v_limit := case when v_plan = 'premium' then 1000000
                    when v_plan = 'starter' then 10
                    else 2 end;
    select count(*) into v_count from posts where user_id = new.user_id;
    if v_count >= v_limit then raise exception 'POST_LIMIT_REACHED'; end if;
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_posts_before_insert_limit on posts;
create trigger trg_posts_before_insert_limit before insert on posts
  for each row execute function _posts_before_insert_limit();

-- ════════════════════════════════════════════════════════════════════════════
-- FIN — CirclUp schema_p5_plans.sql
-- ════════════════════════════════════════════════════════════════════════════
