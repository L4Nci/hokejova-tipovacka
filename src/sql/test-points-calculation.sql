DO $$
DECLARE
  test_match_id UUID;
  test_user_id UUID;
BEGIN
  -- 1. Vytvoření testovacího zápasu
  INSERT INTO public.matches (
    team_home, team_away, 
    flag_home_url, flag_away_url,
    match_time, group_name
  ) VALUES (
    'Česko', 'Slovensko',
    'https://flagcdn.com/w80/cz.png', 'https://flagcdn.com/w80/sk.png',
    NOW() - interval '1 hour', 'A'
  ) RETURNING id INTO test_match_id;

  -- 2. Vytvoření testovacího tipu
  SELECT id INTO test_user_id FROM public.profiles LIMIT 1;
  
  INSERT INTO public.tips (
    user_id, match_id, score_home, score_away
  ) VALUES (
    test_user_id, test_match_id, 3, 2
  );

  -- 3. Vložení výsledku pro otestování výpočtu bodů
  INSERT INTO public.results (
    match_id, final_score_home, final_score_away
  ) VALUES (
    test_match_id, 3, 2
  );

  -- 4. Ověření výsledku
  RAISE NOTICE 'Test dokončen. Zkontrolujte body v tabulce points pro match_id = %', test_match_id;
END $$;

-- Zobrazení výsledků testu
SELECT 
  m.team_home, m.team_away,
  t.score_home as tip_home, t.score_away as tip_away,
  r.final_score_home, r.final_score_away,
  p.points,
  pr.username
FROM public.matches m
JOIN public.tips t ON m.id = t.match_id
JOIN public.results r ON m.id = r.match_id
JOIN public.points p ON t.id = p.tip_id
JOIN public.profiles pr ON t.user_id = pr.id
WHERE m.id = (SELECT id FROM public.matches ORDER BY created_at DESC LIMIT 1);
