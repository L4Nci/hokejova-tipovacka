-- Oprava funkcí a triggerů pro správné fungování tipování

-- 1. Kontrola, zda všechny potřebné tabulky existují a mají správnou strukturu
DO $$
BEGIN
  RAISE NOTICE 'Kontrola struktury databáze pro tipování...';

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tips') THEN
    RAISE NOTICE 'Chybí tabulka tips, vytvářím ji...';
    
    -- Vytvoření tabulky pro tipy, pokud neexistuje
    CREATE TABLE public.tips (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
      score_home INTEGER NOT NULL CHECK (score_home >= 0),
      score_away INTEGER NOT NULL CHECK (score_away >= 0),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE (user_id, match_id)
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'points') THEN
    RAISE NOTICE 'Chybí tabulka points, vytvářím ji...';
    
    -- Vytvoření tabulky pro body, pokud neexistuje
    CREATE TABLE public.points (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
      points INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE (user_id, match_id)
    );
  END IF;
END;
$$;

-- 2. Oprava funkce pro výpočet bodů - správná implementace VOID varianty
CREATE OR REPLACE FUNCTION calculate_points_bulk()
RETURNS VOID AS $$
BEGIN
  -- Smazání existujících bodů pro všechny zápasy s výsledky
  DELETE FROM public.points
  WHERE match_id IN (SELECT match_id FROM public.results);
  
  -- Vložení nových bodů pro všechny zápasy s výsledky
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
  ON CONFLICT (user_id, match_id) 
  DO UPDATE SET 
    points = EXCLUDED.points,
    updated_at = now();
  
END;
$$ LANGUAGE plpgsql;

-- 3. Oprava trigger funkce pro výpočet bodů při aktualizaci jednotlivého zápasu
CREATE OR REPLACE FUNCTION calculate_points_for_match()
RETURNS TRIGGER AS $$
DECLARE
  tip RECORD;
  points_to_award INTEGER;
BEGIN
  -- Projít všechny tipy pro tento zápas
  FOR tip IN
    SELECT * FROM public.tips WHERE match_id = NEW.match_id
  LOOP
    -- Vypočítat body
    points_to_award := 0;
    
    -- Přesný výsledek = 5 bodů
    IF tip.score_home = NEW.final_score_home AND tip.score_away = NEW.final_score_away THEN
      points_to_award := 5;
    -- Správný vítěz nebo remíza = 2 body
    ELSIF 
      (tip.score_home > tip.score_away AND NEW.final_score_home > NEW.final_score_away) OR
      (tip.score_home < tip.score_away AND NEW.final_score_home < NEW.final_score_away) OR
      (tip.score_home = tip.score_away AND NEW.final_score_home = NEW.final_score_away)
    THEN
      points_to_award := 2;
    ELSE
      points_to_award := 0;
    END IF;

    -- Uložit body
    INSERT INTO public.points (user_id, match_id, points)
    VALUES (tip.user_id, NEW.match_id, points_to_award)
    ON CONFLICT (user_id, match_id)
    DO UPDATE SET 
      points = points_to_award,
      updated_at = now();
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Odstranit starý trigger, pokud existuje
DROP TRIGGER IF EXISTS calculate_points_trigger ON public.results;

-- 5. Vytvořit nový trigger (použijeme správnou funkci calculate_points_for_match)
CREATE TRIGGER calculate_points_trigger
AFTER INSERT OR UPDATE ON public.results
FOR EACH ROW EXECUTE FUNCTION calculate_points_for_match();

-- 6. Přepočítat body pro všechny zápasy s výsledky
SELECT calculate_points_bulk();

-- 7. Přidání RLS politik pro tipy, aby uživatelé mohli upravovat jen své tipy
BEGIN;
  -- Reset politik
  DROP POLICY IF EXISTS "Enable read access for all users" ON public.tips;
  DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.tips;
  DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.tips;
  
  -- Základní čtení pro všechny autentizované uživatele
  CREATE POLICY "Enable read access for all users" 
  ON public.tips
  FOR SELECT 
  USING (auth.role() = 'authenticated');
  
  -- Vkládání pro autentizované uživatele s jejich ID
  CREATE POLICY "Enable insert for authenticated users only" 
  ON public.tips
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
  
  -- Úpravy pro vlastní tipy
  CREATE POLICY "Enable update for users based on user_id" 
  ON public.tips
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

  -- Zapnout RLS
  ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
COMMIT;
