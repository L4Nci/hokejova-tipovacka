-- Kontrola propojení dat
SELECT 
  t.id as tip_id,
  t.score_home,
  t.score_away,
  p.username,
  m.team_home,
  m.team_away,
  pts.points
FROM tips t
LEFT JOIN profiles p ON t.user_id = p.id
LEFT JOIN matches m ON t.match_id = m.id
LEFT JOIN points pts ON pts.tip_id = t.id
LIMIT 10;

-- Kontrola chybějících vazeb
SELECT t.id, t.user_id, t.match_id
FROM tips t
LEFT JOIN points p ON p.tip_id = t.id
WHERE p.id IS NULL;
