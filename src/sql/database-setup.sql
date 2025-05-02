-- Vytvoření profiles tabulky (rozšíření pro auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvoření tabulky pro zápasy
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_home TEXT NOT NULL,
  team_away TEXT NOT NULL,
  flag_home_url TEXT,
  flag_away_url TEXT,
  group_name TEXT,  -- Změnili jsme "group" na "group_name"
  match_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvoření tabulky pro tipy
CREATE TABLE IF NOT EXISTS public.tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  match_id UUID REFERENCES public.matches ON DELETE CASCADE NOT NULL,
  score_home INTEGER NOT NULL,
  score_away INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, match_id)
);

-- Vytvoření tabulky pro výsledky
CREATE TABLE IF NOT EXISTS public.results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches ON DELETE CASCADE NOT NULL UNIQUE,
  final_score_home INTEGER NOT NULL,
  final_score_away INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvoření tabulky pro body
CREATE TABLE IF NOT EXISTS public.points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  match_id UUID REFERENCES public.matches ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- Funkce pro výpočet bodů
CREATE OR REPLACE FUNCTION calculate_points()
RETURNS VOID AS $$
BEGIN
  -- Smazání existujících bodů
  DELETE FROM public.points
  WHERE match_id IN (SELECT match_id FROM public.results);
  
  -- Vložení nových bodů
  INSERT INTO public.points (user_id, match_id, points)
  SELECT 
    t.user_id,
    t.match_id,
    CASE
      -- Přesný tip (5 bodů)
      WHEN t.score_home = r.final_score_home AND t.score_away = r.final_score_away THEN 5
      -- Správný vítěz nebo remíza (2 body)
      WHEN (t.score_home > t.score_away AND r.final_score_home > r.final_score_away) OR 
           (t.score_home < t.score_away AND r.final_score_home < r.final_score_away) OR 
           (t.score_home = t.score_away AND r.final_score_home = r.final_score_away) THEN 2
      -- Špatný tip (0 bodů)
      ELSE 0
    END as points
  FROM public.tips t
  JOIN public.results r ON t.match_id = r.match_id
  ON CONFLICT (user_id, match_id) DO UPDATE
  SET points = EXCLUDED.points;
  
END;
$$ LANGUAGE plpgsql;

-- Trigger pro automatický výpočet bodů při vložení nebo aktualizaci výsledku
CREATE OR REPLACE FUNCTION calculate_points_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_points();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_points_trigger ON public.results;
CREATE TRIGGER calculate_points_trigger
AFTER INSERT OR UPDATE ON public.results
FOR EACH STATEMENT EXECUTE FUNCTION calculate_points_trigger();

-- Trigger pro aktualizaci časového razítka
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_timestamp ON public.matches;
CREATE TRIGGER set_updated_at_timestamp
BEFORE UPDATE ON public.matches
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS set_updated_at_timestamp_results ON public.results;
CREATE TRIGGER set_updated_at_timestamp_results
BEFORE UPDATE ON public.results
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Pohled pro žebříček (základní verze)
CREATE OR REPLACE VIEW leaderboard_basic AS
SELECT 
  p.id AS user_id,
  p.username,
  COALESCE(SUM(pts.points), 0) AS total_points
FROM profiles p
LEFT JOIN tips t ON p.id = t.user_id
LEFT JOIN points pts ON t.match_id = pts.match_id AND t.user_id = pts.user_id
GROUP BY p.id, p.username
ORDER BY total_points DESC;

-- Nastavení bezpečnostních pravidel pro Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;

-- Politiky pro profiles
CREATE POLICY "Kdokoliv může číst profily" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Uživatelé mohou upravit svůj profil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Pouze admini mohou vytvářet profily" ON public.profiles
  FOR INSERT WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Politiky pro matches
CREATE POLICY "Kdokoliv může číst zápasy" ON public.matches
  FOR SELECT USING (true);

CREATE POLICY "Pouze admini mohou upravovat zápasy" ON public.matches
  FOR INSERT WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Pouze admini mohou měnit zápasy" ON public.matches
  FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Pouze admini mohou mazat zápasy" ON public.matches
  FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Politiky pro tips
CREATE POLICY "Kdokoliv může číst tipy" ON public.tips
  FOR SELECT USING (true);

CREATE POLICY "Uživatelé mohou vytvářet své tipy" ON public.tips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Uživatelé mohou upravovat své tipy" ON public.tips
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiky pro results
CREATE POLICY "Kdokoliv může číst výsledky" ON public.results
  FOR SELECT USING (true);

CREATE POLICY "Pouze admini mohou zadávat výsledky" ON public.results
  FOR INSERT WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Pouze admini mohou upravovat výsledky" ON public.results
  FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Politiky pro points
CREATE POLICY "Kdokoliv může číst body" ON public.points
  FOR SELECT USING (true);
