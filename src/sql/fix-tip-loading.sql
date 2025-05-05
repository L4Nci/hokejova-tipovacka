-- Přidání indexů pro rychlejší načítání tipů
CREATE INDEX IF NOT EXISTS idx_tips_match_id ON tips(match_id);
CREATE INDEX IF NOT EXISTS idx_tips_user_id ON tips(user_id);
CREATE INDEX IF NOT EXISTS idx_points_match_id ON points(match_id);
CREATE INDEX IF NOT EXISTS idx_points_user_id ON points(user_id);

-- Vytvoření view pro optimalizované načítání tipů
CREATE OR REPLACE VIEW tip_details AS
SELECT 
    t.id,
    t.match_id,
    t.user_id,
    t.score_home,
    t.score_away,
    t.created_at,
    p.points,
    pr.username
FROM tips t
LEFT JOIN points p ON t.match_id = p.match_id AND t.user_id = p.user_id
LEFT JOIN profiles pr ON t.user_id = pr.id;
