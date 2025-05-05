-- Test výpočtu bodů - kompletní opravená verze
DO $$
DECLARE
  test_user_id UUID;
  test_match_id UUID;
  tip_rec RECORD;
BEGIN
  -- Nejdřív zkusíme najít existujícího uživatele
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'tester@example.com';

  -- Pokud uživatel neexistuje, vytvoříme ho
  IF test_user_id IS NULL THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      uuid_generate_v4(),
      '00000000-0000-0000-0000-000000000000',
      'tester@example.com',
      crypt('testpass', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"Tester"}',
      NOW(),
      NOW()
    )
    RETURNING id INTO test_user_id;

    -- Vytvoříme profil pouze pokud jsme vytvořili nového uživatele
    INSERT INTO public.profiles (id, username, role, created_at, updated_at)
    VALUES (test_user_id, 'Tester', 'user', NOW(), NOW());
  END IF;

  -- Vložení nového testovacího zápasu
  INSERT INTO public.matches 
  (team_home, team_away, flag_home_url, flag_away_url, group_name, match_time)
  VALUES 
  ('Česko', 'Slovensko', 'https://flagcdn.com/w80/cz.png', 'https://flagcdn.com/w80/sk.png', 'A', NOW() - interval '2 hours')
  RETURNING id INTO test_match_id;

  -- Vložení testovacího tipu
  INSERT INTO public.tips (user_id, match_id, score_home, score_away)
  VALUES (test_user_id, test_match_id, 3, 2);

  -- Vložení výsledku zápasu
  INSERT INTO public.results (match_id, final_score_home, final_score_away)
  VALUES (test_match_id, 3, 2);  -- Přesný tip pro test

  -- Kontrola výpočtu bodů
  RAISE NOTICE 'Test výpočtu bodů pro zápas % a uživatele %', test_match_id, test_user_id;
  
  -- Výpis bodů - použití FOR LOOP místo PERFORM pro zobrazení výsledků
  FOR tip_rec IN
    SELECT 
      p.username,
      t.score_home AS tip_home,
      t.score_away AS tip_away,
      r.final_score_home,
      r.final_score_away,
      pts.points,
      CASE 
        WHEN t.score_home = r.final_score_home AND t.score_away = r.final_score_away THEN 'Přesný výsledek (5 bodů)'
        WHEN (t.score_home > t.score_away AND r.final_score_home > r.final_score_away) OR
             (t.score_home < t.score_away AND r.final_score_home < r.final_score_away) OR
             (t.score_home = t.score_away AND r.final_score_home = r.final_score_away) THEN 'Správný vítěz (2 body)'
        ELSE 'Špatný tip (0 bodů)'
      END AS explanation
    FROM 
      public.tips t
    JOIN 
      public.matches m ON t.match_id = m.id 
    JOIN 
      public.profiles p ON t.user_id = p.id
    JOIN 
      public.results r ON r.match_id = m.id
    LEFT JOIN
      public.points pts ON pts.match_id = m.id AND pts.user_id = t.user_id
    WHERE
      t.match_id = test_match_id AND t.user_id = test_user_id
  LOOP
    RAISE NOTICE 'Uživatel: %, Tip: %:%, Výsledek: %:%, Body: %, Vyhodnocení: %', 
      tip_rec.username, tip_rec.tip_home, tip_rec.tip_away, 
      tip_rec.final_score_home, tip_rec.final_score_away,
      tip_rec.points, tip_rec.explanation;
  END LOOP;

  -- Výpis pro kontrolu
  RAISE NOTICE 'Pro ověření proveďte následující dotaz:';
  RAISE NOTICE 'SELECT * FROM public.points WHERE match_id = ''%'';', test_match_id;
END;
$$;

-- Vložení několika vzorových zápasů pro test
INSERT INTO matches (
    team_home, 
    team_away, 
    flag_home_url, 
    flag_away_url, 
    group_name, 
    match_time
) VALUES 
('Česko', 'Slovensko', 'https://flagcdn.com/w80/cz.png', 'https://flagcdn.com/w80/sk.png', 'A', '2025-05-09 16:20:00+02'),
('Finsko', 'Švédsko', 'https://flagcdn.com/w80/fi.png', 'https://flagcdn.com/w80/se.png', 'A', '2025-05-09 20:20:00+02'),
('Kanada', 'USA', 'https://flagcdn.com/w80/ca.png', 'https://flagcdn.com/w80/us.png', 'B', '2025-05-10 16:20:00+02')
RETURNING id;

-- Zobrazení všech tipů a bodů pro kontrolu
SELECT 
  m.team_home,
  m.team_away,
  p.username,
  t.score_home as tip_home,
  t.score_away as tip_away,
  r.final_score_home,
  r.final_score_away,
  pts.points,
  CASE 
    WHEN t.score_home = r.final_score_home AND t.score_away = r.final_score_away THEN 'Přesný výsledek (5 bodů)'
    WHEN (t.score_home > t.score_away AND r.final_score_home > r.final_score_away) OR
         (t.score_home < t.score_away AND r.final_score_home < r.final_score_away) OR
         (t.score_home = t.score_away AND r.final_score_home = r.final_score_away) THEN 'Správný vítěz (2 body)'
    ELSE 'Špatný tip (0 bodů)'
  END as hodnoceni
FROM 
  public.matches m
JOIN 
  public.tips t ON m.id = t.match_id
JOIN 
  public.profiles p ON t.user_id = p.id
LEFT JOIN 
  public.results r ON m.id = r.match_id
LEFT JOIN
  public.points pts ON pts.match_id = m.id AND pts.user_id = t.user_id
ORDER BY 
  m.match_time DESC;
