-- Vložení testovacích zápasů pro MS v hokeji 2025
INSERT INTO public.matches
  (team_home, team_away, flag_home_url, flag_away_url, group_name, match_time)
VALUES
  ('Česko', 'Slovensko', 'https://flagcdn.com/w80/cz.png', 'https://flagcdn.com/w80/sk.png', 'A', NOW() + interval '1 day'),
  ('Švédsko', 'Finsko', 'https://flagcdn.com/w80/se.png', 'https://flagcdn.com/w80/fi.png', 'A', NOW() + interval '2 days'),
  ('Kanada', 'USA', 'https://flagcdn.com/w80/ca.png', 'https://flagcdn.com/w80/us.png', 'B', NOW() + interval '3 days'),
  ('Švýcarsko', 'Německo', 'https://flagcdn.com/w80/ch.png', 'https://flagcdn.com/w80/de.png', 'B', NOW() + interval '4 days'),
  ('Lotyšsko', 'Kazachstán', 'https://flagcdn.com/w80/lv.png', 'https://flagcdn.com/w80/kz.png', 'A', NOW() + interval '5 days'),
  ('Francie', 'Rakousko', 'https://flagcdn.com/w80/fr.png', 'https://flagcdn.com/w80/at.png', 'B', NOW() + interval '6 days'),
  ('Česko', 'Finsko', 'https://flagcdn.com/w80/cz.png', 'https://flagcdn.com/w80/fi.png', 'A', NOW() + interval '7 days 2 hours'),
  ('Kanada', 'Německo', 'https://flagcdn.com/w80/ca.png', 'https://flagcdn.com/w80/de.png', 'B', NOW() + interval '7 days 5 hours');

-- Vložení jednoho zápasu v minulosti pro testování zobrazení výsledků
INSERT INTO public.matches
  (team_home, team_away, flag_home_url, flag_away_url, group_name, match_time)
VALUES
  ('Česko', 'USA', 'https://flagcdn.com/w80/cz.png', 'https://flagcdn.com/w80/us.png', 'A', NOW() - interval '1 day');
  
-- Přidání výsledku ukázkového zápasu
INSERT INTO public.results
  (match_id, final_score_home, final_score_away)
SELECT
  id, 3, 2
FROM
  public.matches
WHERE
  team_home = 'Česko' AND team_away = 'USA';
