-- Add created_at column to matches table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'matches' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.matches
    ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Update create-test-data.sql query to use match_time instead of created_at
SELECT id 
FROM matches 
WHERE team_home = 'Česko' AND team_away = 'Slovensko'
ORDER BY match_time DESC 
LIMIT 1;
