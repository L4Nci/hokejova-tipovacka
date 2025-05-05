CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    pr.id as user_id,
    pr.username,
    COUNT(DISTINCT t.match_id) as matches_tipped,
    COALESCE(SUM(p.points), 0) as total_points
FROM profiles pr
LEFT JOIN tips t ON pr.id = t.user_id
LEFT JOIN points p ON t.id = p.tip_id
GROUP BY pr.id, pr.username
ORDER BY total_points DESC, matches_tipped DESC;
