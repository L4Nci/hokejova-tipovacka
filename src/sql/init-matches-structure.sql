-- Nejdřív vyčistíme existující data v matches tabulce
TRUNCATE TABLE public.matches CASCADE;

-- Vytvoříme základní strukturu pro skupiny
INSERT INTO public.matches (
    team_home,
    team_away,
    flag_home_url,
    flag_away_url,
    group_name,
    match_time
) VALUES 
    -- Skupina A
    (
        'Česko',
        'Finsko',
        'https://flagcdn.com/cz.svg',
        'https://flagcdn.com/fi.svg',
        'A',
        '2025-05-09 16:20:00+02'
    ),
    -- Můžeš přidat další zápasy podle reálného rozpisu
    (
        'Švýcarsko', 
        'Norsko',
        'https://flagcdn.com/ch.svg',
        'https://flagcdn.com/no.svg',
        'A',
        '2025-05-09 20:20:00+02'
    );

-- Ověření vložených dat
SELECT 
    id,
    team_home,
    team_away,
    group_name,
    to_char(match_time, 'DD.MM.YYYY HH24:MI') as match_time
FROM public.matches
ORDER BY match_time;
