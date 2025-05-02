-- Vylepšení pohledu a funkce pro žebříček

-- Odstranění původní funkce a pohledu
DROP FUNCTION IF EXISTS get_leaderboard() CASCADE;
DROP VIEW IF EXISTS leaderboard CASCADE;

-- Vytvoření vylepšené funkce pro žebříček s více statistikami
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  total_points BIGINT,
  exact_tips BIGINT,
  correct_winner_tips BIGINT,
  total_tips BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS user_id,
    p.username,
    COALESCE(SUM(pts.points), 0)::BIGINT AS total_points,
    COUNT(CASE WHEN pts.points = 5 THEN 1 END)::BIGINT AS exact_tips,
    COUNT(CASE WHEN pts.points = 2 THEN 1 END)::BIGINT AS correct_winner_tips,
    COUNT(t.id)::BIGINT AS total_tips
  FROM 
    profiles p
  LEFT JOIN
    tips t ON p.id = t.user_id
  LEFT JOIN
    points pts ON t.match_id = pts.match_id AND t.user_id = pts.user_id
  GROUP BY 
    p.id, p.username
  ORDER BY 
    total_points DESC,
    exact_tips DESC,
    username ASC;
END;
$$;

-- Vytvoření pohledu pro žebříček
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  p.id AS user_id,
  p.username,
  COALESCE(SUM(pts.points), 0)::INTEGER AS total_points,
  COUNT(CASE WHEN pts.points = 5 THEN 1 END)::INTEGER AS exact_tips,
  COUNT(CASE WHEN pts.points = 2 THEN 1 END)::INTEGER AS correct_winner_tips,
  COUNT(t.id)::INTEGER AS total_tips
FROM 
  profiles p
LEFT JOIN
  tips t ON p.id = t.user_id
LEFT JOIN
  points pts ON t.match_id = pts.match_id AND t.user_id = pts.user_id
GROUP BY 
  p.id, p.username
ORDER BY 
  total_points DESC,
  exact_tips DESC,
  username ASC;

-- Přidání komentáře pro snadnější pochopení
COMMENT ON VIEW leaderboard IS 'Žebříček hráčů s detaily o jejich tipech a bodech';
