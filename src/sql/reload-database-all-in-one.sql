-- Skript pro opětovné nahrání databáze - vše v jednom souboru
-- Tato verze funguje přímo v Supabase SQL editoru nebo jinde, kde \i příkazy nejsou podporovány

-- 1. Nejprve vyčistit databázi od testovacích dat
DO $$
BEGIN
  -- Smazání záznamů z tabulek v bezpečném pořadí (kvůli cizím klíčům)
  DELETE FROM public.points;
  DELETE FROM public.results;
  DELETE FROM public.tips;
  DELETE FROM public.matches;
  
  -- Zachováme profily uživatelů, ale ne jejich tipy
  RAISE NOTICE 'Testovací data byla odstraněna';
END;
$$;

-- 2. Opravit funkci calculate_points, která způsobovala chybu
-- Nejprve odstranit trigger, který závisí na funkci
DROP TRIGGER IF EXISTS calculate_points_trigger ON public.results;

-- Odstranit funkce, které mohou záviset na calculate_points
DROP FUNCTION IF EXISTS calculate_points_trigger();

-- Odstranit samotnou funkci calculate_points
DROP FUNCTION IF EXISTS calculate_points();

-- Znovu vytvořit funkci calculate_points s požadovaným návratovým typem
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

-- 3. Opravit trigger pro výpočet bodů
-- Vytvořit trigger funkci
CREATE OR REPLACE FUNCTION calculate_points_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_points();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Přidat trigger
CREATE TRIGGER calculate_points_trigger
AFTER INSERT OR UPDATE ON public.results
FOR EACH ROW EXECUTE FUNCTION calculate_points_trigger();

-- 4. Opravit funkci calculate_points() pro individuální výpočet
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

-- 5. Oprava pohledu pro žebříček
DROP VIEW IF EXISTS leaderboard;

CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  prof.id as user_id,
  prof.username,
  COALESCE(SUM(p.points), 0)::INTEGER as total_points,
  COUNT(DISTINCT CASE WHEN p.points > 0 THEN p.match_id END) as successful_tips
FROM 
  profiles prof
LEFT JOIN
  points p ON p.user_id = prof.id
GROUP BY 
  prof.id, prof.username
ORDER BY 
  total_points DESC,
  prof.username ASC;

-- 6. Vytvoření admin uživatele
-- Tento krok by měl být proveden pomocí skriptu create-admin.js,
-- protože vyžaduje použití service_role klíče.

-- 7. Vložení testovacích dat (malý vzorek)
INSERT INTO public.matches
  (team_home, team_away, flag_home_url, flag_away_url, group_name, match_time)
VALUES
  ('Česko', 'Slovensko', 'https://flagcdn.com/w80/cz.png', 'https://flagcdn.com/w80/sk.png', 'A', NOW() + interval '1 day'),
  ('Švédsko', 'Finsko', 'https://flagcdn.com/w80/se.png', 'https://flagcdn.com/w80/fi.png', 'A', NOW() + interval '2 days'),
  ('Kanada', 'USA', 'https://flagcdn.com/w80/ca.png', 'https://flagcdn.com/w80/us.png', 'B', NOW() + interval '3 days'),
  ('Švýcarsko', 'Německo', 'https://flagcdn.com/w80/ch.png', 'https://flagcdn.com/w80/de.png', 'B', NOW() - interval '1 day');

-- 8. Zkontrolovat databázi
DO $$
BEGIN
  RAISE NOTICE '------------------------------------';
  RAISE NOTICE 'Databáze byla úspěšně přenahrána';
  RAISE NOTICE '------------------------------------';
  
  -- Zkontrolovat počty záznamů
  RAISE NOTICE 'Počet zápasů: %', (SELECT COUNT(*) FROM public.matches);
  RAISE NOTICE 'Počet výsledků: %', (SELECT COUNT(*) FROM public.results);
  RAISE NOTICE 'Počet tipů: %', (SELECT COUNT(*) FROM public.tips);
  RAISE NOTICE 'Počet bodů: %', (SELECT COUNT(*) FROM public.points);
END;
$$;
