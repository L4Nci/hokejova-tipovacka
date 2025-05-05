-- Nejprve vytvoříme všechny potřebné tabulky
BEGIN;

-- Tabulka zápasů
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_home VARCHAR(255) NOT NULL,
    team_away VARCHAR(255) NOT NULL,
    flag_home_url TEXT NOT NULL,
    flag_away_url TEXT NOT NULL,
    match_time TIMESTAMP WITH TIME ZONE NOT NULL,
    group_name CHAR(1) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabulka výsledků
CREATE TABLE IF NOT EXISTS public.results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    final_score_home INTEGER NOT NULL,
    final_score_away INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabulka tipů
CREATE TABLE IF NOT EXISTS public.tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    score_home INTEGER NOT NULL,
    score_away INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabulka bodů
CREATE TABLE IF NOT EXISTS public.points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    tip_id UUID REFERENCES public.tips(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexy pro lepší výkon
CREATE INDEX IF NOT EXISTS idx_matches_time ON public.matches(match_time);
CREATE INDEX IF NOT EXISTS idx_matches_group ON public.matches(group_name);
CREATE INDEX IF NOT EXISTS idx_tips_user ON public.tips(user_id);
CREATE INDEX IF NOT EXISTS idx_tips_match ON public.tips(match_id);
CREATE INDEX IF NOT EXISTS idx_points_user ON public.points(user_id);
CREATE INDEX IF NOT EXISTS idx_points_match ON public.points(match_id);

-- Drop existing view first
DROP VIEW IF EXISTS public.leaderboard;

-- Pohled pro žebříček
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    u.id as user_id,
    p.username,
    COUNT(po.points) as total_tips,
    SUM(po.points) as total_points,
    COUNT(CASE WHEN po.points = 5 THEN 1 END) as perfect_tips,
    COUNT(CASE WHEN po.points = 2 THEN 1 END) as correct_winner_tips
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.points po ON u.id = po.user_id
GROUP BY u.id, p.username
ORDER BY total_points DESC NULLS LAST;

COMMIT;
