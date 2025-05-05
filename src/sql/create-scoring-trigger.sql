-- Function pro výpočet bodů
CREATE OR REPLACE FUNCTION calculate_points_for_match() 
RETURNS TRIGGER AS $$
BEGIN
  -- Nejprve smažeme existující body pro tento zápas
  DELETE FROM public.points 
  WHERE match_id = NEW.match_id;

  -- Vložíme nové body pro všechny tipy
  INSERT INTO public.points (user_id, match_id, tip_id, points)
  SELECT 
    t.user_id,
    t.match_id,
    t.id as tip_id,
    CASE 
      WHEN t.score_home = NEW.final_score_home AND t.score_away = NEW.final_score_away THEN 5
      WHEN (t.score_home > t.score_away AND NEW.final_score_home > NEW.final_score_away) OR
           (t.score_home < t.score_away AND NEW.final_score_home < NEW.final_score_away) OR
           (t.score_home = t.score_away AND NEW.final_score_home = NEW.final_score_away) THEN 2
      ELSE 0
    END as points
  FROM public.tips t
  WHERE t.match_id = NEW.match_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pro automatický výpočet bodů při zadání nebo změně výsledku
DROP TRIGGER IF EXISTS calculate_points_trigger ON public.results;
CREATE TRIGGER calculate_points_trigger
  AFTER INSERT OR UPDATE ON public.results
  FOR EACH ROW
  EXECUTE FUNCTION calculate_points_for_match();
