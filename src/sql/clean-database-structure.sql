-- 1. Tabulka pro uživatele/hráče (profiles)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabulka pro zápasy
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_home TEXT NOT NULL,
    team_away TEXT NOT NULL,
    flag_home_url TEXT,
    flag_away_url TEXT,
    group_name TEXT,
    match_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabulka pro tipy uživatelů
CREATE TABLE tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    score_home INTEGER NOT NULL CHECK (score_home >= 0),
    score_away INTEGER NOT NULL CHECK (score_away >= 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, match_id)  -- každý uživatel může mít jen jeden tip na zápas
);

-- 4. Tabulka pro výsledky zápasů
CREATE TABLE results (
    match_id UUID PRIMARY KEY REFERENCES matches(id) ON DELETE CASCADE,
    final_score_home INTEGER NOT NULL CHECK (final_score_home >= 0),
    final_score_away INTEGER NOT NULL CHECK (final_score_away >= 0),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. View pro žebříček (místo ukládání bodů do samostatné tabulky)
CREATE VIEW leaderboard AS
WITH user_points AS (
    SELECT 
        t.user_id,
        t.match_id,
        CASE
            -- Přesný tip = 5 bodů
            WHEN t.score_home = r.final_score_home 
                 AND t.score_away = r.final_score_away THEN 5
            -- Správný vítěz nebo remíza = 2 body    
            WHEN (t.score_home > t.score_away AND r.final_score_home > r.final_score_away) OR
                 (t.score_home < t.score_away AND r.final_score_home < r.final_score_away) OR
                 (t.score_home = t.score_away AND r.final_score_home = r.final_score_away) THEN 2
            -- Jinak 0 bodů
            ELSE 0
        END as points
    FROM tips t
    JOIN results r ON t.match_id = r.match_id
)
SELECT 
    p.id as user_id,
    p.username,
    COALESCE(SUM(up.points), 0) as total_points,
    COUNT(DISTINCT up.match_id) as matches_tipped
FROM profiles p
LEFT JOIN user_points up ON p.id = up.user_id
GROUP BY p.id, p.username
ORDER BY total_points DESC;

-- Funkce pro kontrolu, zda lze ještě tipovat (5 minut před zápasem)
CREATE OR REPLACE FUNCTION can_tip(match_time TIMESTAMPTZ)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN match_time > (now() + interval '5 minutes');
END;
$$ LANGUAGE plpgsql;

-- Trigger pro kontrolu času při vkládání/úpravě tipu
CREATE OR REPLACE FUNCTION check_tip_timing()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT can_tip((SELECT match_time FROM matches WHERE id = NEW.match_id)) THEN
        RAISE EXCEPTION 'Nelze tipovat méně než 5 minut před začátkem zápasu';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_tip_timing
BEFORE INSERT OR UPDATE ON tips
FOR EACH ROW EXECUTE FUNCTION check_tip_timing();

-- View pro zobrazení tipů na zápasy
CREATE OR REPLACE VIEW match_tips AS
SELECT 
    t.*,
    p.username,
    m.match_time,
    m.team_home,
    m.team_away 
FROM tips t
JOIN profiles p ON t.user_id = p.id 
JOIN matches m ON t.match_id = m.id;
