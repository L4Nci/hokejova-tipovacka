-- First drop the dependent view
DROP VIEW IF EXISTS leaderboard;

-- Drop existing trigger and functions
DROP TRIGGER IF EXISTS on_result_update ON results;
DROP FUNCTION IF EXISTS update_tip_points();
DROP FUNCTION IF EXISTS calculate_points();

-- Recreate points table with correct structure
DROP TABLE IF EXISTS points;
CREATE TABLE points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id),
    match_id UUID NOT NULL REFERENCES matches(id),
    points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, match_id)
);

-- Create updated calculation function
CREATE OR REPLACE FUNCTION calculate_points_for_match()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update points for all tips of this match
    INSERT INTO points (user_id, match_id, points)
    SELECT 
        t.user_id,
        t.match_id,
        CASE
            WHEN t.score_home = NEW.final_score_home 
                 AND t.score_away = NEW.final_score_away THEN 5
            WHEN (t.score_home > t.score_away AND NEW.final_score_home > NEW.final_score_away) OR
                 (t.score_home < t.score_away AND NEW.final_score_home < NEW.final_score_away) OR
                 (t.score_home = t.score_away AND NEW.final_score_home = NEW.final_score_away) THEN 2
            ELSE 0
        END as points
    FROM tips t
    WHERE t.match_id = NEW.match_id
    ON CONFLICT (user_id, match_id) 
    DO UPDATE SET 
        points = EXCLUDED.points;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER calculate_points_trigger
    AFTER INSERT OR UPDATE ON results
    FOR EACH ROW
    EXECUTE FUNCTION calculate_points_for_match();

-- Recreate the leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    p.user_id,
    pr.username,
    SUM(p.points) as total_points,
    COUNT(DISTINCT p.match_id) as matches_predicted,
    COUNT(CASE WHEN p.points = 5 THEN 1 END) as perfect_predictions,
    COUNT(CASE WHEN p.points = 2 THEN 1 END) as correct_winner_predictions,
    COUNT(CASE WHEN p.points = 0 THEN 1 END) as wrong_predictions
FROM points p
JOIN profiles pr ON p.user_id = pr.id
GROUP BY p.user_id, pr.username
ORDER BY total_points DESC;
