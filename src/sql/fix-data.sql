-- 1. Vyčistíme všechna existující data
TRUNCATE TABLE results CASCADE;
TRUNCATE TABLE tips CASCADE;
TRUNCATE TABLE matches CASCADE;

-- 2. Vložíme oficiální zápasy znovu
INSERT INTO matches (id, team_home, team_away, flag_home_url, flag_away_url, match_time, group_name)
VALUES 
  (gen_random_uuid(), 'Kanada', 'Finsko', '/flags/can.png', '/flags/fin.png', '2025-05-09 16:20:00+02', 'A'),
  (gen_random_uuid(), 'Švédsko', 'Slovensko', '/flags/swe.png', '/flags/svk.png', '2025-05-09 20:20:00+02', 'A');

-- 3. Vložíme testovací výsledky pro dva zápasy
DO $$
DECLARE
    match1_id UUID;
    match2_id UUID;
BEGIN
    SELECT id INTO match1_id FROM matches WHERE team_home = 'Kanada' AND team_away = 'Finsko';
    SELECT id INTO match2_id FROM matches WHERE team_home = 'Švédsko' AND team_away = 'Slovensko';

    INSERT INTO results (match_id, final_score_home, final_score_away)
    VALUES 
        (match1_id, 3, 2),
        (match2_id, 1, 4);
END $$;

-- 4. Kontrola
SELECT 
    m.team_home, 
    m.team_away, 
    r.final_score_home, 
    r.final_score_away
FROM matches m
LEFT JOIN results r ON m.id = r.match_id
ORDER BY m.match_time;
