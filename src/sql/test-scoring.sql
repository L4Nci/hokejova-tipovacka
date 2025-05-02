-- Test výpočtu bodů - kompletní opravená verze
DO $$
DECLARE
  test_user_id UUID;
  test_match_id UUID;
  tip_rec RECORD;
BEGIN
  -- Získáme testovacího uživatele (bereme prvního s rolí 'tester' nebo prvního dostupného)
  SELECT id INTO test_user_id FROM public.profiles 
  WHERE role = 'tester' OR username = 'Tester' 
  LIMIT 1;
  
  IF test_user_id IS NULL THEN
    -- Pokud nebyl nalezen tester, vezmeme prvního uživatele
    SELECT id INTO test_user_id FROM public.profiles LIMIT 1;
    
    IF test_user_id IS NULL THEN
      RAISE EXCEPTION 'Nebyl nalezen žádný uživatel pro testování';
    END IF;
  END IF;

  -- 1. Vložení nového zápasu pro testování
  INSERT INTO public.matches 
  (team_home, team_away, flag_home_url, flag_away_url, group_name, match_time)
  VALUES 
  ('Rusko', 'Norsko', 'https://flagcdn.com/w80/ru.png', 'https://flagcdn.com/w80/no.png', 'C', NOW() - interval '2 hours')
  RETURNING id INTO test_match_id;  -- Using renamed variable

  RAISE NOTICE 'Vytvořen testovací zápas s ID: %', test_match_id;

  -- 2. Vložení testovacího tipu
  INSERT INTO public.tips (user_id, match_id, score_home, score_away)
  VALUES (test_user_id, test_match_id, 3, 1);  -- Using renamed variables
  
  RAISE NOTICE 'Vytvořen testovací tip pro uživatele % a zápas %', test_user_id, test_match_id;

  -- 3. Vložení výsledku zápasu - Rusko 3:1 Norsko
  INSERT INTO public.results (match_id, final_score_home, final_score_away)
  VALUES (test_match_id, 3, 1);  -- Using renamed variable
  
  RAISE NOTICE 'Vložen výsledek zápasu: 3:1';

  -- 4. Kontrola výpočtu bodů po vložení výsledku
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
      t.match_id = test_match_id AND t.user_id = test_user_id  -- Fixed the ambiguity
  LOOP
    RAISE NOTICE 'Uživatel: %, Tip: %:%, Výsledek: %:%, Body: %, Vyhodnocení: %', 
      tip_rec.username, tip_rec.tip_home, tip_rec.tip_away, 
      tip_rec.final_score_home, tip_rec.final_score_away,
      tip_rec.points, tip_rec.explanation;
  END LOOP;

  -- Výpis pro kontrolu
  RAISE NOTICE 'Pro ověření proveďte následující dotaz:';
  RAISE NOTICE 'SELECT * FROM public.points WHERE match_id = ''%'';', test_match_id;  -- Using renamed variable
END;
$$;

-- Volitelné: Zobrazit výsledky testovacího zápasu
SELECT 
  m.team_home, 
  m.team_away, 
  r.final_score_home, 
  r.final_score_away, 
  p.username, 
  t.score_home, 
  t.score_away, 
  pts.points
FROM 
  public.matches m
JOIN 
  public.results r ON m.id = r.match_id
JOIN 
  public.tips t ON t.match_id = m.id
JOIN 
  public.profiles p ON t.user_id = p.id
LEFT JOIN 
  public.points pts ON pts.match_id = m.id AND pts.user_id = t.user_id
WHERE 
  m.team_home = 'Rusko' AND m.team_away = 'Norsko';

-- Output explanation
-- Rusko | Norsko | 3:1 | Tester | 3:1 | 5
-- Meaning:
-- team_home | team_away | final_score_home:final_score_away | username | tip_score_home:tip_score_away | points
