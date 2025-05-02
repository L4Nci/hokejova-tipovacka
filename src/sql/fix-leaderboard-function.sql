-- Odstranění původní funkce
DROP FUNCTION IF EXISTS get_leaderboard();

-- Vytvoření funkce znovu s opravami
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  total_points INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    prof.username,
    COALESCE(SUM(p.points), 0)::INTEGER as total_points
  FROM 
    profiles prof
  LEFT JOIN
    points p ON p.user_id = prof.id
  GROUP BY 
    p.user_id, prof.username
  ORDER BY 
    total_points DESC;
END;
$$;

-- Oprava pohledu pro žebříček
DROP VIEW IF EXISTS leaderboard;

CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  prof.id as user_id,
  prof.username,
  COALESCE(SUM(p.points), 0)::INTEGER as total_points
FROM 
  profiles prof
LEFT JOIN
  points p ON p.user_id = prof.id
GROUP BY 
  prof.id, prof.username
ORDER BY 
  total_points DESC;
