-- Kontrola zápasů a jejich výsledků
SELECT 
    m.id,
    m.team_home,
    m.team_away,
    m.match_time,
    m.group_name,
    CASE
        WHEN r.match_id IS NULL THEN 'Bez výsledku'
        ELSE CONCAT(r.final_score_home, ':', r.final_score_away)
    END as result,
    COUNT(t.id) as tip_count,
    CASE 
        WHEN m.match_time > NOW() THEN 'Nadcházející'
        WHEN r.match_id IS NULL AND m.match_time <= NOW() THEN 'Čeká na zadání výsledku'
        ELSE 'Dokončený'
    END as status
FROM matches m
LEFT JOIN results r ON m.id = r.match_id
LEFT JOIN tips t ON m.id = t.match_id
GROUP BY m.id, m.team_home, m.team_away, m.match_time, m.group_name, r.match_id, r.final_score_home, r.final_score_away
ORDER BY m.match_time DESC;

-- Počty podle stavů
SELECT 
    COUNT(*) as total_matches,
    SUM(CASE WHEN match_time < NOW() THEN 1 ELSE 0 END) as past_matches,
    SUM(CASE WHEN r.id IS NOT NULL THEN 1 ELSE 0 END) as matches_with_results
FROM matches m
LEFT JOIN results r ON m.id = r.match_id;
