-- Skript pro vložení testovacích dat do hokejové tipovačky

-- 1. SEKCE: ZÁPASY (MATCHES)
-- Struktura: team_home, team_away, flag_home_url, flag_away_url, group_name, match_time
-- Příklady vlajek: https://flagcdn.com/cs.svg (dvoupísmenný kód země)
INSERT INTO public.matches (team_home, team_away, flag_home_url, flag_away_url, group_name, match_time)
VALUES 
-- Základní skupina A (příklady)
('Česko', 'Švýcarsko', 'https://flagcdn.com/cz.svg', 'https://flagcdn.com/ch.svg', 'A', '2025-05-10 16:20:00+02'),
('Kanada', 'Finsko', 'https://flagcdn.com/ca.svg', 'https://flagcdn.com/fi.svg', 'A', '2025-05-10 20:20:00+02'),
('Dánsko', 'Norsko', 'https://flagcdn.com/dk.svg', 'https://flagcdn.com/no.svg', 'A', '2025-05-11 16:20:00+02'),
('Rakousko', 'Česko', 'https://flagcdn.com/at.svg', 'https://flagcdn.com/cz.svg', 'A', '2025-05-11 20:20:00+02'),

-- Základní skupina B (příklady) 
('Švédsko', 'USA', 'https://flagcdn.com/se.svg', 'https://flagcdn.com/us.svg', 'B', '2025-05-10 12:20:00+02'),
('Německo', 'Slovensko', 'https://flagcdn.com/de.svg', 'https://flagcdn.com/sk.svg', 'B', '2025-05-10 16:20:00+02');

-- Další zápasy můžete přidat v podobném formátu
-- Příklady kódů vlajek: cz (Česko), sk (Slovensko), ca (Kanada), us (USA), se (Švédsko), fi (Finsko)
-- de (Německo), ch (Švýcarsko), at (Rakousko), dk (Dánsko), no (Norsko), lv (Lotyšsko), fr (Francie)

-- 1. Vložení testovacích zápasů
INSERT INTO public.matches
  (team_home, team_away, flag_home_url, flag_away_url, group_name, match_time)
VALUES
  ('Česko', 'Slovensko', 'https://flagcdn.com/w80/cz.png', 'https://flagcdn.com/w80/sk.png', 'A', NOW() + interval '1 day'),
  ('Švédsko', 'Finsko', 'https://flagcdn.com/w80/se.png', 'https://flagcdn.com/w80/fi.png', 'A', NOW() + interval '2 days'),
  ('Kanada', 'USA', 'https://flagcdn.com/w80/ca.png', 'https://flagcdn.com/w80/us.png', 'B', NOW() + interval '3 days'),
  ('Švýcarsko', 'Německo', 'https://flagcdn.com/w80/ch.png', 'https://flagcdn.com/w80/de.png', 'B', NOW() - interval '1 day');

-- 2. SEKCE: UŽIVATELÉ A PROFILY
-- Vytvoření běžných uživatelů pro testování
DO $$
DECLARE
  user1_id UUID;
  user2_id UUID;
BEGIN
  -- První testovací uživatel
  INSERT INTO auth.users (
    instance_id, id, email, encrypted_password, email_confirmed_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'petr@example.com',
    crypt('petr123', gen_salt('bf')),
    now()
  ) RETURNING id INTO user1_id;
  
  INSERT INTO public.profiles (id, username, role)
  VALUES (user1_id, 'Petr', 'user');
  
  -- Druhý testovací uživatel
  INSERT INTO auth.users (
    instance_id, id, email, encrypted_password, email_confirmed_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'jana@example.com',
    crypt('jana123', gen_salt('bf')),
    now()
  ) RETURNING id INTO user2_id;
  
  INSERT INTO public.profiles (id, username, role)
  VALUES (user2_id, 'Jana', 'user');

  RAISE NOTICE 'Vytvořeni uživatelé: Petr (petr@example.com / petr123) a Jana (jana@example.com / jana123)';
END;
$$;

-- Vytvoření běžného uživatelského účtu pro testování (použijeme SQL místo UI)
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Vytvoření testovacího uživatele v auth.users
  INSERT INTO auth.users (
    instance_id, id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'test@example.com',
    crypt('test123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"username": "Tester"}'::jsonb,
    now(),
    now()
  ) RETURNING id INTO test_user_id;

  -- Vytvoření profilu pro testovacího uživatele
  INSERT INTO public.profiles (id, username, role)
  VALUES (test_user_id, 'Tester', 'user');

  -- Vytvoření tipů pro zápasy
  INSERT INTO public.tips (user_id, match_id, score_home, score_away)
  SELECT test_user_id, id, 3, 1 FROM public.matches WHERE team_home = 'Česko';
  
  INSERT INTO public.tips (user_id, match_id, score_home, score_away)
  SELECT test_user_id, id, 2, 2 FROM public.matches WHERE team_home = 'Švédsko';
  
  INSERT INTO public.tips (user_id, match_id, score_home, score_away)
  SELECT test_user_id, id, 1, 4 FROM public.matches WHERE team_home = 'Kanada';
  
  INSERT INTO public.tips (user_id, match_id, score_home, score_away)
  SELECT test_user_id, id, 2, 1 FROM public.matches WHERE team_home = 'Švýcarsko';
  
  -- Vložení výsledku zápasu, který již proběhl
  INSERT INTO public.results (match_id, final_score_home, final_score_away)
  SELECT id, 2, 1 FROM public.matches WHERE team_home = 'Švýcarsko';
  
  RAISE NOTICE 'Testovací uživatel vytvořen s ID: %', test_user_id;
END;
$$;

-- 3. SEKCE: TIPY
-- Vygenerování náhodných tipů pro všechny zápasy a uživatele (kromě admina)
INSERT INTO public.tips (user_id, match_id, score_home, score_away)
SELECT 
  u.id as user_id, 
  m.id as match_id, 
  FLOOR(random() * 5)::INT as score_home, 
  FLOOR(random() * 5)::INT as score_away
FROM 
  auth.users u 
  CROSS JOIN public.matches m
WHERE 
  u.email != 'admin@example.com'
ON CONFLICT (user_id, match_id) DO NOTHING;

-- 4. SEKCE: VÝSLEDKY
-- Přidání výsledků pro některé zápasy jako ukázka
-- Přidáme výsledky jen pro 2 zápasy, aby ostatní zůstaly jako budoucí
INSERT INTO public.results (match_id, final_score_home, final_score_away)
SELECT id, 3, 2 
FROM public.matches 
ORDER BY match_time ASC
LIMIT 1;

INSERT INTO public.results (match_id, final_score_home, final_score_away)
SELECT id, 1, 4 
FROM public.matches 
ORDER BY match_time ASC
OFFSET 1 LIMIT 1;

-- Přepočet bodů po vložení výsledků
SELECT calculate_points();

-- 5. SEKCE: KONTROLA VLOŽENÝCH DAT
SELECT 'Počet vložených zápasů: ' || COUNT(*) as info FROM public.matches;
SELECT 'Počet vložených tipů: ' || COUNT(*) as info FROM public.tips;
SELECT 'Počet vložených výsledků: ' || COUNT(*) as info FROM public.results;
SELECT 'Počet vygenerovaných bodů: ' || COUNT(*) as info FROM public.points;

-- 3. Kontrola vložených dat
SELECT 'Zápasy:' AS info;
SELECT team_home, team_away, group_name, match_time FROM public.matches;

SELECT 'Uživatelé:' AS info;
SELECT username, role FROM public.profiles;

SELECT 'Tipy:' AS info;
SELECT t.score_home, t.score_away, m.team_home, m.team_away
FROM public.tips t 
JOIN public.matches m ON t.match_id = m.id;

SELECT 'Výsledky a body:' AS info;
SELECT m.team_home, m.team_away, r.final_score_home, r.final_score_away, p.points
FROM public.results r 
JOIN public.matches m ON r.match_id = m.id
LEFT JOIN public.points p ON p.match_id = r.match_id;

-- 6. PŘÍKLADY DOTAZŮ PRO KONTROLU
-- Získání všech zápasů s jejich výsledky (pokud existují)
SELECT 
  m.id,
  m.team_home,
  m.team_away,
  m.match_time,
  r.final_score_home,
  r.final_score_away
FROM 
  public.matches m
LEFT JOIN 
  public.results r ON m.id = r.match_id
ORDER BY 
  m.match_time ASC;

-- Získání žebříčku uživatelů podle počtu bodů
SELECT
  prof.username,
  SUM(p.points) as total_points,
  COUNT(p.id) as tips_with_results
FROM
  public.profiles prof
JOIN
  public.points p ON p.user_id = prof.id
GROUP BY 
  prof.id, prof.username
ORDER BY 
  total_points DESC,
  prof.username ASC;
