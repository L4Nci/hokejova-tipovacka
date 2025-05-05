DO $$
BEGIN
  -- Vymaž všechny testovací tipy
  DELETE FROM tips
  WHERE user_id IN (
    SELECT id FROM profiles 
    WHERE username LIKE 'TestUser%'
  );

  -- Vymaž všechny testovací zápasy
  DELETE FROM matches 
  WHERE team_home IN ('Česko', 'Finsko', 'Kanada')
  AND team_away IN ('Slovensko', 'Švédsko', 'USA');

  -- Vymaž testovací uživatele
  DELETE FROM profiles
  WHERE username LIKE 'TestUser%';

  RAISE NOTICE 'Testovací data byla úspěšně odstraněna.';
END;
$$;
