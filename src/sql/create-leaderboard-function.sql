-- Funkce pro výpočet celkového žebříčku uživatelů

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
    SUM(p.points)::INTEGER as total_points
  FROM 
    points p
  JOIN 
    profiles prof ON p.user_id = prof.id
  GROUP BY 
    p.user_id, prof.username
  ORDER BY 
    total_points DESC;
END;
$$;

-- Vytvoření pohledu pro žebříček (alternativní přístup)
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  p.user_id,
  prof.username,
  SUM(p.points)::INTEGER as total_points
FROM 
  points p
JOIN 
  profiles prof ON p.user_id = prof.id
GROUP BY 
  p.user_id, prof.username
ORDER BY 
  total_points DESC;
