-- 1. Drop view first
DROP VIEW IF EXISTS public.leaderboard;

-- 2. Drop existing points table
DROP TABLE IF EXISTS public.points;

-- 3. Create new points table with correct structure
CREATE TABLE public.points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    match_id UUID NOT NULL REFERENCES public.matches(id),
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT points_user_match_unique UNIQUE (user_id, match_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_points_user_match 
ON public.points(user_id, match_id);

-- 4. Recreate the leaderboard view
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    p.user_id,
    pr.username,
    SUM(p.points) as total_points,
    COUNT(DISTINCT p.match_id) as matches_predicted
FROM public.points p
JOIN public.profiles pr ON p.user_id = pr.id
GROUP BY p.user_id, pr.username
ORDER BY total_points DESC;

-- 5. Update calculation function
CREATE OR REPLACE FUNCTION calculate_points_bulk()
RETURNS VOID AS $$
BEGIN
  -- Clear existing points
  DELETE FROM public.points;
  
  -- Insert new points
  INSERT INTO public.points (user_id, match_id, points)
  SELECT 
    t.user_id,
    t.match_id,
    CASE
      WHEN t.score_home = r.final_score_home 
           AND t.score_away = r.final_score_away THEN 5
      WHEN (t.score_home > t.score_away AND r.final_score_home > r.final_score_away) OR
           (t.score_home < t.score_away AND r.final_score_home < r.final_score_away) OR
           (t.score_home = t.score_away AND r.final_score_home = r.final_score_away) THEN 2
      ELSE 0
    END
  FROM public.tips t
  INNER JOIN public.results r ON t.match_id = r.match_id;

  RAISE NOTICE 'Points calculation completed';
END;
$$ LANGUAGE plpgsql;

-- 6. Test the function
DO $$
BEGIN
  PERFORM calculate_points_bulk();
END $$;

-- 7. Verify points calculation
SELECT 
  p.user_id,
  prof.username,
  m.team_home,
  m.team_away,
  t.score_home as tip_home,
  t.score_away as tip_away,
  r.final_score_home,
  r.final_score_away,
  p.points,
  m.match_time
FROM public.points p
JOIN public.tips t ON t.user_id = p.user_id AND t.match_id = p.match_id
JOIN public.results r ON r.match_id = p.match_id
JOIN public.matches m ON m.id = p.match_id
JOIN public.profiles prof ON prof.id = p.user_id
ORDER BY m.match_time DESC
LIMIT 10;
