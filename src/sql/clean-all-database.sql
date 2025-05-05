-- Drop all triggers first
DROP TRIGGER IF EXISTS enforce_tip_timing ON tips;
DROP TRIGGER IF EXISTS update_profiles_timestamp ON profiles;

-- Drop all views
DROP VIEW IF EXISTS leaderboard CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS check_tip_timing();
DROP FUNCTION IF EXISTS can_tip(TIMESTAMPTZ);
DROP FUNCTION IF EXISTS calculate_points();
DROP FUNCTION IF EXISTS calculate_points_for_match();
DROP FUNCTION IF EXISTS calculate_points_bulk();

-- Drop tables in correct order due to dependencies
DROP TABLE IF EXISTS points CASCADE;
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS tips CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Notify when complete
DO $$
BEGIN
  RAISE NOTICE 'All database objects have been dropped successfully';
END $$;

DO $$
BEGIN
  -- Vypni foreign key kontroly
  SET CONSTRAINTS ALL DEFERRED;
  
  -- Vymaž data ze všech tabulek v určeném pořadí
  DELETE FROM points;
  DELETE FROM tips;
  DELETE FROM results;
  DELETE FROM matches;
  DELETE FROM profiles;
  
  -- Zapni foreign key kontroly
  SET CONSTRAINTS ALL IMMEDIATE;
  
  RAISE NOTICE 'Databáze byla úspěšně vyčištěna.';
END;
$$;
