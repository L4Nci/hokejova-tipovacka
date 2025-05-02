-- Komplexní test výpočtu bodů - testuje všechny scénáře bodování
DO $$
DECLARE
  test_user_id UUID;
  match_id_exact UUID;      -- Zápas pro přesný výsledek (5 bodů)
  match_id_winner UUID;     -- Zápas pro správného vítěze (2 body)
  match_id_wrong UUID;      -- Zápas pro špatný tip (0 bodů)
  match_id_draw_exact UUID; -- Zápas pro přesnou remízu (5 bodů)
  match_id_draw_right UUID; -- Zápas pro správnou remízu ale jiný výsledek (2 body)
  match_id_draw_wrong UUID; -- Zápas s remízou v tipu ale jiný výsledek (0 bodů)
  user_exists BOOLEAN;
  points_value INTEGER;     -- Added missing declaration for points_value variable
BEGIN
  -- Kontrola, zda existuje testovací uživatel
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE username = 'Tester') INTO user_exists;
  
  IF NOT user_exists THEN
    RAISE NOTICE 'Testovací uživatel "Tester" neexistuje. Vytváříme ho...';
    
    -- Vytvoříme testovacího uživatele
    INSERT INTO auth.users (
      instance_id, id, email, encrypted_password, email_confirmed_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'tester@example.com',
      crypt('test123', gen_salt('bf')),
      now()
    ) RETURNING id INTO test_user_id;
    
    INSERT INTO public.profiles (id, username, role)
    VALUES (test_user_id, 'Tester', 'user');
    
    RAISE NOTICE 'Testovací uživatel vytvořen s ID: %', test_user_id;
  ELSE
    SELECT id INTO test_user_id FROM public.profiles WHERE username = 'Tester';
    RAISE NOTICE 'Nalezen existující testovací uživatel s ID: %', test_user_id;
  END IF;
  
  -- 1. TEST PŘESNÉHO VÝSLEDKU (5 bodů)
  -- Vytvoření zápasu
  INSERT INTO public.matches (team_home, team_away, flag_home_url, flag_away_url, group_name, match_time)
  VALUES ('Česko', 'Kanada', 'https://flagcdn.com/w80/cz.png', 'https://flagcdn.com/w80/ca.png', 'A', NOW() - interval '3 hours')
  RETURNING id INTO match_id_exact;

  -- Vytvoření tipu
  INSERT INTO public.tips (user_id, match_id, score_home, score_away)
  VALUES (test_user_id, match_id_exact, 3, 2);
  
  -- Vložení výsledku (stejný jako tip)
  INSERT INTO public.results (match_id, final_score_home, final_score_away)
  VALUES (match_id_exact, 3, 2);
  
  -- 2. TEST SPRÁVNÉHO VÍTĚZE (2 body)
  -- Vytvoření zápasu
  INSERT INTO public.matches (team_home, team_away, flag_home_url, flag_away_url, group_name, match_time)
  VALUES ('Švédsko', 'USA', 'https://flagcdn.com/w80/se.png', 'https://flagcdn.com/w80/us.png', 'B', NOW() - interval '4 hours')
  RETURNING id INTO match_id_winner;

  -- Vytvoření tipu (Švédsko vyhraje, ale s jiným skóre)
  INSERT INTO public.tips (user_id, match_id, score_home, score_away)
  VALUES (test_user_id, match_id_winner, 4, 1);
  
  -- Vložení výsledku (Švédsko vyhraje, ale s jiným skóre)
  INSERT INTO public.results (match_id, final_score_home, final_score_away)
  VALUES (match_id_winner, 2, 1);
  
  -- 3. TEST ŠPATNÉHO TIPU (0 bodů)
  -- Vytvoření zápasu
  INSERT INTO public.matches (team_home, team_away, flag_home_url, flag_away_url, group_name, match_time)
  VALUES ('Finsko', 'Slovensko', 'https://flagcdn.com/w80/fi.png', 'https://flagcdn.com/w80/sk.png', 'C', NOW() - interval '5 hours')
  RETURNING id INTO match_id_wrong;

  -- Vytvoření tipu (Finsko vyhraje)
  INSERT INTO public.tips (user_id, match_id, score_home, score_away)
  VALUES (test_user_id, match_id_wrong, 3, 1);
  
  -- Vložení výsledku (Slovensko vyhraje - tip je špatně)
  INSERT INTO public.results (match_id, final_score_home, final_score_away)
  VALUES (match_id_wrong, 2, 4);
  
  -- 4. TEST PŘESNÉ REMÍZY (5 bodů)
  -- Vytvoření zápasu
  INSERT INTO public.matches (team_home, team_away, flag_home_url, flag_away_url, group_name, match_time)
  VALUES ('Německo', 'Švýcarsko', 'https://flagcdn.com/w80/de.png', 'https://flagcdn.com/w80/ch.png', 'D', NOW() - interval '6 hours')
  RETURNING id INTO match_id_draw_exact;

  -- Vytvoření tipu (remíza 2:2)
  INSERT INTO public.tips (user_id, match_id, score_home, score_away)
  VALUES (test_user_id, match_id_draw_exact, 2, 2);
  
  -- Vložení výsledku (remíza 2:2)
  INSERT INTO public.results (match_id, final_score_home, final_score_away)
  VALUES (match_id_draw_exact, 2, 2);
  
  -- 5. TEST SPRÁVNÉ REMÍZY, ALE JINÝ VÝSLEDEK (2 body)
  -- Vytvoření zápasu
  INSERT INTO public.matches (team_home, team_away, flag_home_url, flag_away_url, group_name, match_time)
  VALUES ('Lotyšsko', 'Francie', 'https://flagcdn.com/w80/lv.png', 'https://flagcdn.com/w80/fr.png', 'D', NOW() - interval '7 hours')
  RETURNING id INTO match_id_draw_right;

  -- Vytvoření tipu (remíza 1:1)
  INSERT INTO public.tips (user_id, match_id, score_home, score_away)
  VALUES (test_user_id, match_id_draw_right, 1, 1);
  
  -- Vložení výsledku (remíza 3:3)
  INSERT INTO public.results (match_id, final_score_home, final_score_away)
  VALUES (match_id_draw_right, 3, 3);
  
  -- 6. TEST ŠPATNÉ REMÍZY (0 bodů)
  -- Vytvoření zápasu
  INSERT INTO public.matches (team_home, team_away, flag_home_url, flag_away_url, group_name, match_time)
  VALUES ('Rakousko', 'Dánsko', 'https://flagcdn.com/w80/at.png', 'https://flagcdn.com/w80/dk.png', 'A', NOW() - interval '8 hours')
  RETURNING id INTO match_id_draw_wrong;

  -- Vytvoření tipu (remíza 2:2)
  INSERT INTO public.tips (user_id, match_id, score_home, score_away)
  VALUES (test_user_id, match_id_draw_wrong, 2, 2);
  
  -- Vložení výsledku (Dánsko vyhraje - tip je špatně)
  INSERT INTO public.results (match_id, final_score_home, final_score_away)
  VALUES (match_id_draw_wrong, 1, 3);

  -- Zobrazení výsledků pro jednotlivé testy
  RAISE NOTICE '=== VÝSLEDKY TESTŮ BODOVÁNÍ ===';
  RAISE NOTICE '------------------------------';
  
  -- Výsledky pro test 1 - přesný výsledek (5 bodů)
  RAISE NOTICE 'TEST 1: Přesný výsledek (očekáváno 5 bodů)';
  RAISE NOTICE 'Zápas: Česko vs Kanada';
  RAISE NOTICE 'Tip: 3:2, Skutečný výsledek: 3:2';
  SELECT points INTO STRICT points_value FROM public.points WHERE match_id = match_id_exact AND user_id = test_user_id;
  RAISE NOTICE 'Přiděleno bodů: %', points_value;
  RAISE NOTICE '------------------------------';
  
  -- Výsledky pro test 2 - správný vítěz (2 body)
  RAISE NOTICE 'TEST 2: Správný vítěz (očekávány 2 body)';
  RAISE NOTICE 'Zápas: Švédsko vs USA';
  RAISE NOTICE 'Tip: 4:1, Skutečný výsledek: 2:1';
  SELECT points INTO STRICT points_value FROM public.points WHERE match_id = match_id_winner AND user_id = test_user_id;
  RAISE NOTICE 'Přiděleno bodů: %', points_value;
  RAISE NOTICE '------------------------------';
  
  -- Výsledky pro test 3 - špatný tip (0 bodů)
  RAISE NOTICE 'TEST 3: Špatný tip (očekáváno 0 bodů)';
  RAISE NOTICE 'Zápas: Finsko vs Slovensko';
  RAISE NOTICE 'Tip: 3:1, Skutečný výsledek: 2:4';
  SELECT points INTO STRICT points_value FROM public.points WHERE match_id = match_id_wrong AND user_id = test_user_id;
  RAISE NOTICE 'Přiděleno bodů: %', points_value;
  RAISE NOTICE '------------------------------';
  
  -- Výsledky pro test 4 - přesná remíza (5 bodů)
  RAISE NOTICE 'TEST 4: Přesná remíza (očekáváno 5 bodů)';
  RAISE NOTICE 'Zápas: Německo vs Švýcarsko';
  RAISE NOTICE 'Tip: 2:2, Skutečný výsledek: 2:2';
  SELECT points INTO STRICT points_value FROM public.points WHERE match_id = match_id_draw_exact AND user_id = test_user_id;
  RAISE NOTICE 'Přiděleno bodů: %', points_value;
  RAISE NOTICE '------------------------------';
  
  -- Výsledky pro test 5 - správná remíza, jiný výsledek (2 body)
  RAISE NOTICE 'TEST 5: Správná remíza, jiný výsledek (očekávány 2 body)';
  RAISE NOTICE 'Zápas: Lotyšsko vs Francie';
  RAISE NOTICE 'Tip: 1:1, Skutečný výsledek: 3:3';
  SELECT points INTO STRICT points_value FROM public.points WHERE match_id = match_id_draw_right AND user_id = test_user_id;
  RAISE NOTICE 'Přiděleno bodů: %', points_value;
  RAISE NOTICE '------------------------------';
  
  -- Výsledky pro test 6 - špatná remíza (0 bodů)
  RAISE NOTICE 'TEST 6: Špatná remíza (očekáváno 0 bodů)';
  RAISE NOTICE 'Zápas: Rakousko vs Dánsko';
  RAISE NOTICE 'Tip: 2:2, Skutečný výsledek: 1:3';
  SELECT points INTO STRICT points_value FROM public.points WHERE match_id = match_id_draw_wrong AND user_id = test_user_id;
  RAISE NOTICE 'Přiděleno bodů: %', points_value;
  RAISE NOTICE '------------------------------';

  -- Zobrazení souhrnné tabulky výsledků
  RAISE NOTICE 'SOUHRN TESTŮ:';
  RAISE NOTICE 'Zobrazení výsledků ze všech testů:';
  
END;
$$;

-- Zobrazení výsledků pro kontrolu
SELECT 
  m.id AS match_id,
  m.team_home, 
  m.team_away, 
  t.score_home AS tip_score_home, 
  t.score_away AS tip_score_away,
  r.final_score_home,
  r.final_score_away,
  p.username,
  pts.points,
  CASE 
    WHEN t.score_home = r.final_score_home AND t.score_away = r.final_score_away THEN 'Přesný výsledek (5 bodů)'
    WHEN (t.score_home > t.score_away AND r.final_score_home > r.final_score_away) OR
         (t.score_home < t.score_away AND r.final_score_home < r.final_score_away) OR
         (t.score_home = t.score_away AND r.final_score_home = r.final_score_away) THEN 'Správný vítěz/remíza (2 body)'
    ELSE 'Špatný tip (0 bodů)'
  END AS vyhodnoceni
FROM 
  public.matches m
JOIN 
  public.tips t ON m.id = t.match_id
JOIN 
  public.results r ON m.id = r.match_id
JOIN 
  public.profiles p ON t.user_id = p.id
LEFT JOIN 
  public.points pts ON pts.match_id = m.id AND pts.user_id = t.user_id
WHERE 
  p.username = 'Tester'
ORDER BY 
  m.match_time DESC;
