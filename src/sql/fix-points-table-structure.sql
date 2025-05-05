-- Oprava funkcí pro výpočet bodů - odstraněno použití sloupce updated_at, který neexistuje

-- Zjištění aktuální struktury tabulky pro body
DO $$
BEGIN
  RAISE NOTICE 'Struktura tabulky "points":';
  FOR r IN (
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'points'
    ORDER BY ordinal_position
  ) LOOP
    RAISE NOTICE '%: % (nullable: %)', r.column_name, r.data_type, r.is_nullable;
  END LOOP;
END $$;

-- 1. Oprava funkce pro hromadný výpočet bodů bez použití updated_at
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
    points = EXCLUDED.points;
  
END;
$$ LANGUAGE plpgsql;

-- 2. Oprava trigger funkce pro výpočet bodů při aktualizaci jednotlivého zápasu
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

    -- Uložit body bez updated_at sloupce
    INSERT INTO public.points (user_id, match_id, points)
    VALUES (tip.user_id, NEW.match_id, points_to_award)
    ON CONFLICT (user_id, match_id)
    DO UPDATE SET 
      points = points_to_award;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Přepočítat body pro všechny zápasy s výsledky
SELECT calculate_points_bulk();

-- 4. Vypsat nějaké testovací body pro kontrolu
SELECT 
  p.username, 
  m.team_home, 
  m.team_away, 
  t.score_home, 
  t.score_away, 
  r.final_score_home, 
  r.final_score_away, 
  pts.points
FROM 
  public.points pts
JOIN 
  public.profiles p ON pts.user_id = p.id
JOIN 
  public.matches m ON pts.match_id = m.id
JOIN 
  public.tips t ON t.match_id = pts.match_id AND t.user_id = pts.user_id
JOIN 
  public.results r ON r.match_id = pts.match_id
LIMIT 10;
