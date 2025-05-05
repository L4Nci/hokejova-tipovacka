-- Skript pro vložení testovacích dat do hokejové tipovačky

-- Vložení reálných zápasů MS 2025
INSERT INTO matches (id, team_home, team_away, flag_home_url, flag_away_url, match_time, group_name)
VALUES 
  (gen_random_uuid(), 'Kanada', 'Finsko', '/flags/can.png', '/flags/fin.png', '2025-05-09 16:20:00+02', 'A'),
  (gen_random_uuid(), 'Švédsko', 'Slovensko', '/flags/swe.png', '/flags/svk.png', '2025-05-09 20:20:00+02', 'A'),
  (gen_random_uuid(), 'USA', 'Německo', '/flags/usa.png', '/flags/ger.png', '2025-05-10 12:20:00+02', 'B'),
  (gen_random_uuid(), 'Česko', 'Švýcarsko', '/flags/cze.png', '/flags/sui.png', '2025-05-10 20:20:00+02', 'B')
RETURNING id;

-- Pro navázání výsledků a tipů potřebujeme nejdřív uložit vygenerovaná ID
DO $$
DECLARE
  match1_id UUID;
  match2_id UUID;
  test_user1_id UUID := gen_random_uuid();
  test_user2_id UUID := gen_random_uuid();
  test_user3_id UUID := gen_random_uuid(); 
BEGIN
  -- Získání ID prvních dvou zápasů
  SELECT id INTO match1_id FROM matches WHERE team_home = 'Kanada' AND team_away = 'Finsko';
  SELECT id INTO match2_id FROM matches WHERE team_home = 'Švédsko' AND team_away = 'Slovensko';

  -- Vytvoření testovacích uživatelů v auth.users
  INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data, role)
  VALUES 
    (test_user1_id, 'test1@example.com', crypt('testpass123', gen_salt('bf')), '{"username":"TestUser1"}'::jsonb, 'authenticated'),
    (test_user2_id, 'test2@example.com', crypt('testpass123', gen_salt('bf')), '{"username":"TestUser2"}'::jsonb, 'authenticated'),
    (test_user3_id, 'test3@example.com', crypt('testpass123', gen_salt('bf')), '{"username":"TestUser3"}'::jsonb, 'authenticated');

  -- Nyní můžeme vytvořit profily pro tyto uživatele
  INSERT INTO profiles (id, username, created_at)
  VALUES 
    (test_user1_id, 'TestUser1', NOW()),
    (test_user2_id, 'TestUser2', NOW()),
    (test_user3_id, 'TestUser3', NOW())
  ON CONFLICT DO NOTHING;

  -- Vložení výsledků pro již odehrané zápasy
  INSERT INTO results (match_id, final_score_home, final_score_away)
  VALUES 
    (match1_id, 3, 2),
    (match2_id, 1, 4);

  -- Vložení tipů pro různé uživatele
  WITH inserted_tips AS (
    INSERT INTO tips (id, user_id, match_id, score_home, score_away, created_at)
    VALUES 
      (gen_random_uuid(), test_user1_id, match1_id, 3, 2, NOW() - INTERVAL '3 days'),
      (gen_random_uuid(), test_user2_id, match1_id, 2, 1, NOW() - INTERVAL '3 days'),
      (gen_random_uuid(), test_user3_id, match1_id, 1, 2, NOW() - INTERVAL '3 days'),
      (gen_random_uuid(), test_user1_id, match2_id, 2, 3, NOW() - INTERVAL '2 days'),
      (gen_random_uuid(), test_user2_id, match2_id, 1, 4, NOW() - INTERVAL '2 days'),
      (gen_random_uuid(), test_user3_id, match2_id, 2, 2, NOW() - INTERVAL '2 days')
    RETURNING id, score_home, score_away, match_id
  )
  -- Vložení bodů za tipy
  INSERT INTO points (tip_id, points)
  SELECT 
    id,
    CASE 
      WHEN (score_home = (SELECT final_score_home FROM results WHERE match_id = inserted_tips.match_id)
        AND score_away = (SELECT final_score_away FROM results WHERE match_id = inserted_tips.match_id)) THEN 5
      WHEN (score_home > score_away AND (SELECT final_score_home FROM results WHERE match_id = inserted_tips.match_id) > (SELECT final_score_away FROM results WHERE match_id = inserted_tips.match_id))
        OR (score_home < score_away AND (SELECT final_score_home FROM results WHERE match_id = inserted_tips.match_id) < (SELECT final_score_away FROM results WHERE match_id = inserted_tips.match_id)) THEN 2
      ELSE 0
    END as points
  FROM inserted_tips;

END $$;
