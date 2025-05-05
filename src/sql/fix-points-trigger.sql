CREATE OR REPLACE FUNCTION calculate_points_for_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Smaž staré body pro tento zápas
  DELETE FROM points WHERE match_id = NEW.match_id;
  
  -- Vlož nové body
  INSERT INTO points (tip_id, user_id, match_id, points)
  SELECT 
    t.id,
    t.user_id,
    t.match_id,
    CASE
      WHEN t.score_home = NEW.final_score_home 
       AND t.score_away = NEW.final_score_away THEN 5
      WHEN (t.score_home > t.score_away AND NEW.final_score_home > NEW.final_score_away) OR
           (t.score_home < t.score_away AND NEW.final_score_home < NEW.final_score_away) OR
           (t.score_home = t.score_away AND NEW.final_score_home = NEW.final_score_away) THEN 2
      ELSE 0
    END
  FROM tips t
  WHERE t.match_id = NEW.match_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
