-- Úprava triggerů pro správnou funkci přepisování tipů

-- Nejprve upravíme tabulku tipů, aby umožnila správné aktualizace
COMMENT ON TABLE public.tips IS 'Tabulka pro uložení tipů uživatelů s možností aktualizace';

-- Funkce pro aktualizaci časového razítka při aktualizaci tipu
CREATE OR REPLACE FUNCTION update_tip_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Vytvoření triggeru pro aktualizaci časového razítka
DROP TRIGGER IF EXISTS set_tip_updated_at ON public.tips;
CREATE TRIGGER set_tip_updated_at
BEFORE UPDATE ON public.tips
FOR EACH ROW
EXECUTE FUNCTION update_tip_timestamp();

-- Ujistíme se, že calculate_points() trigger funguje správně při aktualizaci výsledků
CREATE OR REPLACE FUNCTION calculate_points()
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

-- Aktualizace triggeru pro výpočet bodů
DROP TRIGGER IF EXISTS calculate_points_trigger ON public.results;
CREATE TRIGGER calculate_points_trigger
AFTER INSERT OR UPDATE ON public.results
FOR EACH ROW
EXECUTE FUNCTION calculate_points();
