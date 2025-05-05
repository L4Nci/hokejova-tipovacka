DO $$
DECLARE
  match_rec RECORD;
  user_rec RECORD;
BEGIN
  -- Pro každý zápas
  FOR match_rec IN SELECT id FROM matches LOOP
    -- Pro každého testovacího uživatele
    FOR user_rec IN SELECT id FROM profiles WHERE username IN ('TestUser1', 'TestUser2') LOOP
      -- Vytvořit náhodný tip
      INSERT INTO tips (user_id, match_id, score_home, score_away)
      VALUES (
        user_rec.id,
        match_rec.id,
        floor(random() * 5)::int,  -- Náhodné skóre 0-4
        floor(random() * 5)::int
      )
      ON CONFLICT (user_id, match_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
