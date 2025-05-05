-- Základní tabulka pro uživatelské profily
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'tester')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Vytvoření tabulky matches
CREATE TABLE matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_home TEXT NOT NULL,
    team_away TEXT NOT NULL,
    flag_home_url TEXT,
    flag_away_url TEXT,
    match_time TIMESTAMPTZ NOT NULL,
    group_name TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Vytvoření tabulky tips
CREATE TABLE tips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    match_id UUID REFERENCES matches(id) NOT NULL,
    score_home INTEGER CHECK (score_home >= 0),
    score_away INTEGER CHECK (score_away >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, match_id)
);

-- Vytvoření tabulky results
CREATE TABLE results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES matches(id) UNIQUE NOT NULL,
    final_score_home INTEGER CHECK (final_score_home >= 0),
    final_score_away INTEGER CHECK (final_score_away >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Vytvoření tabulky points
CREATE TABLE points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tip_id UUID REFERENCES tips(id) UNIQUE NOT NULL,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger pro aktualizaci updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tips_updated_at
    BEFORE UPDATE ON tips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_results_updated_at
    BEFORE UPDATE ON results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
