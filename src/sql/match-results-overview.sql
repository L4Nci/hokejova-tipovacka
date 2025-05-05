-- Komplexní přehled zápasů a výsledků
WITH tip_stats AS (
    SELECT 
        t.match_id,
        COUNT(*) as total_tips,
        COUNT(CASE WHEN p.points = 5 THEN 1 END) as perfect_tips,
        COUNT(CASE WHEN p.points = 2 THEN 1 END) as correct_winner_tips,
        COUNT(CASE WHEN p.points = 0 THEN 1 END) as wrong_tips
    FROM tips t
    LEFT JOIN points p ON t.id = p.tip_id
    GROUP BY t.match_id
)
SELECT 
    m.id,
    m.team_home,
    m.team_away,
    m.group_name,
    to_char(m.match_time, 'DD.MM.YYYY HH24:MI') as match_time,
    CASE
        WHEN r.match_id IS NOT NULL THEN 
            CONCAT(r.final_score_home, ':', r.final_score_away)
        ELSE 'Čeká na výsledek'
    END as result,
    CASE 
        WHEN m.match_time > NOW() THEN 'Nadcházející'
        WHEN r.match_id IS NULL AND m.match_time <= NOW() THEN 'Čeká na zadání výsledku'
        ELSE 'Dokončený'
    END as status,
    COALESCE(ts.total_tips, 0) as total_tips,
    COALESCE(ts.perfect_tips, 0) as perfect_predictions,
    COALESCE(ts.correct_winner_tips, 0) as correct_winner_predictions,
    COALESCE(ts.wrong_tips, 0) as wrong_predictions,
    CASE 
        WHEN r.match_id IS NOT NULL THEN
            CASE 
                WHEN r.final_score_home > r.final_score_away THEN m.team_home
                WHEN r.final_score_home < r.final_score_away THEN m.team_away
                ELSE 'Remíza'
            END
        ELSE NULL
    END as winner
FROM matches m
LEFT JOIN results r ON m.id = r.match_id
LEFT JOIN tip_stats ts ON m.id = ts.match_id
ORDER BY 
    CASE 
        WHEN m.match_time > NOW() THEN 0  -- Nadcházející zápasy první
        WHEN r.match_id IS NULL THEN 1     -- Pak zápasy čekající na výsledek
        ELSE 2                             -- Nakonec dokončené zápasy
    END,
    m.match_time DESC;

-- Souhrnné statistiky včetně času
SELECT
    COUNT(*) as total_matches,
    COUNT(r.match_id) as matches_with_results,
    SUM(CASE WHEN m.match_time < NOW() THEN 1 ELSE 0 END) as past_matches,
    SUM(CASE WHEN m.match_time > NOW() THEN 1 ELSE 0 END) as upcoming_matches,
    COUNT(CASE WHEN r.final_score_home > r.final_score_away THEN 1 END) as home_wins,
    COUNT(CASE WHEN r.final_score_home < r.final_score_away THEN 1 END) as away_wins,
    COUNT(CASE WHEN r.final_score_home = r.final_score_away THEN 1 END) as draws,
    MIN(CASE WHEN m.match_time > NOW() THEN m.match_time END) as next_match_time,
    MAX(CASE WHEN m.match_time < NOW() THEN m.match_time END) as last_match_time
FROM matches m
LEFT JOIN results r ON m.id = r.match_id;
