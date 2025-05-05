-- Vytvoření testovacích hráčů s propojením na auth.users
DO $$
DECLARE
  player_names TEXT[] := ARRAY[
    'Player1', 'Player2', 'Player3', 'Player4',
    'Player5', 'Player6', 'Player7', 'Player8'
  ];
  player_name TEXT;
  new_user_id UUID;
BEGIN
  FOREACH player_name IN ARRAY player_names LOOP
    -- Nejdřív vytvořit uživatele v auth.users
    INSERT INTO auth.users (
      email,
      email_confirmed_at,
      raw_user_meta_data
    ) VALUES (
      player_name || '@example.com',
      now(),
      jsonb_build_object('username', player_name)
    )
    RETURNING id INTO new_user_id;

    -- Pak vytvořit profil s ID z auth.users
    INSERT INTO profiles (id, username, role)
    VALUES (
      new_user_id,
      player_name,
      'user'
    )
    ON CONFLICT (username) DO NOTHING;

  END LOOP;
END $$;
