-- Test match creation
INSERT INTO matches (
    id, 
    team_home, 
    team_away, 
    flag_home_url, 
    flag_away_url, 
    match_time, 
    group_name
)
VALUES (
  gen_random_uuid(),
  'Česko',
  'Slovensko', 
  '/flags/cze.png',
  '/flags/svk.png',
  NOW() + interval '1 day',
  'A'
);

-- Test tips creation for predefined group of players
DO $$
DECLARE
  match_id UUID;
  test_players UUID[];
  player_id UUID;
BEGIN
  -- First ensure we have test players
  FOR i IN 1..8 LOOP
    -- Create user in auth.users first
    INSERT INTO auth.users (
      email,
      email_confirmed_at,
      raw_user_meta_data
    ) VALUES (
      'player' || i || '@test.com',
      now(),
      jsonb_build_object('username', 'Player' || i)
    )
    RETURNING id INTO player_id;

    -- Then create profile
    INSERT INTO profiles (id, username, role)
    VALUES (
      player_id,
      'Player' || i,
      'user'
    )
    ON CONFLICT (username) DO NOTHING;
  END LOOP;

  -- Get all test players
  test_players := ARRAY(
    SELECT id FROM profiles 
    WHERE username LIKE 'Player%'
    ORDER BY username
    LIMIT 8
  );

  -- Get match ID
  SELECT id INTO match_id 
  FROM matches 
  WHERE team_home = 'Česko' 
    AND team_away = 'Slovensko'
  ORDER BY match_time DESC 
  LIMIT 1;

  -- Create tips for each test player
  FOR i IN 1..array_length(test_players, 1) LOOP
    INSERT INTO tips (user_id, match_id, score_home, score_away)
    VALUES (
      test_players[i],
      match_id,
      floor(random() * 5)::int,
      floor(random() * 5)::int
    );
  END LOOP;
END $$;
