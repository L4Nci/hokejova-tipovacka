-- 1. Nejdřív vytvoříme tabulku profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabulka pro tipy
CREATE TABLE IF NOT EXISTS tips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    score_home INTEGER NOT NULL CHECK (score_home >= 0),
    score_away INTEGER NOT NULL CHECK (score_away >= 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, match_id)
);

-- 3. Tabulka pro výsledky zápasů
CREATE TABLE IF NOT EXISTS results (
    match_id UUID PRIMARY KEY REFERENCES matches(id) ON DELETE CASCADE,
    final_score_home INTEGER NOT NULL CHECK (final_score_home >= 0),
    final_score_away INTEGER NOT NULL CHECK (final_score_away >= 0),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabulka pro body
CREATE TABLE IF NOT EXISTS points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tip_id UUID REFERENCES tips(id) ON DELETE CASCADE UNIQUE,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
