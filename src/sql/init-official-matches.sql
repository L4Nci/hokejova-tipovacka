-- Nejdřív vytvoříme tabulku matches pokud neexistuje
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_home VARCHAR(255) NOT NULL,
    team_away VARCHAR(255) NOT NULL,
    flag_home_url TEXT NOT NULL,
    flag_away_url TEXT NOT NULL,
    group_name CHAR(1) NOT NULL,
    match_time TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Vyčistíme existující data
TRUNCATE TABLE public.matches CASCADE;

-- Skupina A (Stockholm)
INSERT INTO public.matches (team_home, team_away, flag_home_url, flag_away_url, group_name, match_time) VALUES
('Česko', 'Švédsko', 'https://flagcdn.com/w80/cz.png', 'https://flagcdn.com/w80/se.png', 'A', '2025-05-09 16:20:00+02'),
('Finsko', 'Kanada', 'https://flagcdn.com/w80/fi.png', 'https://flagcdn.com/w80/ca.png', 'A', '2025-05-09 20:20:00+02'),
('Norsko', 'Švýcarsko', 'https://flagcdn.com/w80/no.png', 'https://flagcdn.com/w80/ch.png', 'A', '2025-05-10 12:20:00+02'),
('Rakousko', 'Dánsko', 'https://flagcdn.com/w80/at.png', 'https://flagcdn.com/w80/dk.png', 'A', '2025-05-10 16:20:00+02'),
('Česko', 'Kanada', 'https://flagcdn.com/w80/cz.png', 'https://flagcdn.com/w80/ca.png', 'A', '2025-05-11 16:20:00+02'),
('Švédsko', 'Norsko', 'https://flagcdn.com/w80/se.png', 'https://flagcdn.com/w80/no.png', 'A', '2025-05-11 20:20:00+02'),
('Finsko', 'Rakousko', 'https://flagcdn.com/w80/fi.png', 'https://flagcdn.com/w80/at.png', 'A', '2025-05-12 20:20:00+02'),
('Švýcarsko', 'Dánsko', 'https://flagcdn.com/w80/ch.png', 'https://flagcdn.com/w80/dk.png', 'A', '2025-05-13 16:20:00+02'),

-- Skupina B (Praha)
('USA', 'Německo', 'https://flagcdn.com/w80/us.png', 'https://flagcdn.com/w80/de.png', 'B', '2025-05-09 16:20:00+02'),
('Slovensko', 'Lotyšsko', 'https://flagcdn.com/w80/sk.png', 'https://flagcdn.com/w80/lv.png', 'B', '2025-05-09 20:20:00+02'),
('Francie', 'Kazachstán', 'https://flagcdn.com/w80/fr.png', 'https://flagcdn.com/w80/kz.png', 'B', '2025-05-10 12:20:00+02'),
('Německo', 'Lotyšsko', 'https://flagcdn.com/w80/de.png', 'https://flagcdn.com/w80/lv.png', 'B', '2025-05-10 16:20:00+02'),
('USA', 'Francie', 'https://flagcdn.com/w80/us.png', 'https://flagcdn.com/w80/fr.png', 'B', '2025-05-11 16:20:00+02'),
('Slovensko', 'Kazachstán', 'https://flagcdn.com/w80/sk.png', 'https://flagcdn.com/w80/kz.png', 'B', '2025-05-11 20:20:00+02'),

-- Play-off
-- Čtvrtfinále
('A1', 'B4', 'https://flagcdn.com/w80/placeholder.png', 'https://flagcdn.com/w80/placeholder.png', 'P', '2025-05-22 16:20:00+02'),
('A2', 'B3', 'https://flagcdn.com/w80/placeholder.png', 'https://flagcdn.com/w80/placeholder.png', 'P', '2025-05-22 20:20:00+02'),
('B1', 'A4', 'https://flagcdn.com/w80/placeholder.png', 'https://flagcdn.com/w80/placeholder.png', 'P', '2025-05-23 16:20:00+02'),
('B2', 'A3', 'https://flagcdn.com/w80/placeholder.png', 'https://flagcdn.com/w80/placeholder.png', 'P', '2025-05-23 20:20:00+02'),

-- Semifinále
('QF1', 'QF3', 'https://flagcdn.com/w80/placeholder.png', 'https://flagcdn.com/w80/placeholder.png', 'P', '2025-05-24 16:20:00+02'),
('QF2', 'QF4', 'https://flagcdn.com/w80/placeholder.png', 'https://flagcdn.com/w80/placeholder.png', 'P', '2025-05-24 20:20:00+02'),

-- O bronz
('SF1', 'SF2', 'https://flagcdn.com/w80/placeholder.png', 'https://flagcdn.com/w80/placeholder.png', 'P', '2025-05-25 16:20:00+02'),

-- Finále
('SF1', 'SF2', 'https://flagcdn.com/w80/placeholder.png', 'https://flagcdn.com/w80/placeholder.png', 'P', '2025-05-25 20:20:00+02');

-- Změna všech URL vlajek na w80 verze
UPDATE matches 
SET 
    flag_home_url = REPLACE(flag_home_url, '.svg', '.png'),
    flag_away_url = REPLACE(flag_away_url, '.svg', '.png');

UPDATE matches 
SET 
    flag_home_url = REPLACE(flag_home_url, 'flagcdn.com/', 'flagcdn.com/w80/'),
    flag_away_url = REPLACE(flag_away_url, 'flagcdn.com/', 'flagcdn.com/w80/');

-- Přidáme indexy pro lepší výkon
CREATE INDEX IF NOT EXISTS idx_matches_time ON public.matches(match_time);
CREATE INDEX IF NOT EXISTS idx_matches_group ON public.matches(group_name);
