SELECT 
    m.id,
    m.team_home,
    m.team_away,
    m.match_time,
    r.final_score_home,
    r.final_score_away,
    CASE 
        WHEN r.match_id IS NULL AND m.match_time < NOW() THEN 'Čeká na zadání výsledku'
        WHEN r.match_id IS NOT NULL THEN 'Výsledek zadán'
        ELSE 'Budoucí zápas'
    END as status
FROM matches m
LEFT JOIN results r ON m.id = r.match_id
ORDER BY m.match_time DESC;
