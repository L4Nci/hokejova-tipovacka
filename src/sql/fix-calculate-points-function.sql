-- Oprava funkce calculate_points() - řeší chybu: ERROR: 42P13: cannot change return type of existing function

-- 1. Nejprve odstranit trigger, který závisí na funkci
DROP TRIGGER IF EXISTS calculate_points_trigger ON public.results;

-- 2. Odstranit funkce, které mohou záviset na calculate_points
DROP FUNCTION IF EXISTS calculate_points_trigger();

-- 3. Odstranit samotnou funkci calculate_points
DROP FUNCTION IF EXISTS calculate_points();

-- 4. Znovu vytvořit funkci calculate_points - nejprve jako VOID funkci
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

-- 5. Vytvořit funkci calculate_points_trigger()
CREATE OR REPLACE FUNCTION calculate_points_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_points();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Znovu přidat trigger
CREATE TRIGGER calculate_points_trigger
AFTER INSERT OR UPDATE ON public.results
FOR EACH ROW EXECUTE FUNCTION calculate_points_trigger();

-- 7. Nyní teprve vytvořit variantu calculate_points jako TRIGGER funkci
CREATE OR REPLACE FUNCTION calculate_individual_points()
RETURNS TRIGGER AS $$
DECLARE
  tip RECORD;
  points_to_award INTEGER;
BEGIN
  -- Projdi všechny tipy pro tento zápas
  FOR tip IN
    SELECT * FROM public.tips WHERE match_id = NEW.match_id
  LOOP
    -- Vypočítej body
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

    -- Vlož nebo aktualizuj záznam v tabulce bodů
    INSERT INTO public.points (user_id, match_id, points)
    VALUES (tip.user_id, NEW.match_id, points_to_award)
    ON CONFLICT (user_id, match_id)
    DO UPDATE SET 
      points = points_to_award,
      created_at = now();
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Informovat o úspěšné opravě
DO $$
BEGIN
  RAISE NOTICE 'Funkce calculate_points() a související triggery byly úspěšně obnoveny';
END;
$$;
