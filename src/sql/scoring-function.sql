CREATE OR REPLACE FUNCTION calculate_points(
    tip_score_home INTEGER,
    tip_score_away INTEGER, 
    actual_score_home INTEGER,
    actual_score_away INTEGER
) RETURNS INTEGER AS $$
BEGIN
    -- Přesný tip - 5 bodů
    IF tip_score_home = actual_score_home AND tip_score_away = actual_score_away THEN
        RETURN 5;
    END IF;
    
    -- Správný rozdíl nebo správný vítěz + remíza - 2 body
    IF (tip_score_home - tip_score_away) = (actual_score_home - actual_score_away) OR
       (tip_score_home > tip_score_away AND actual_score_home > actual_score_away) OR
       (tip_score_home < tip_score_away AND actual_score_home < actual_score_away) OR
       (tip_score_home = tip_score_away AND actual_score_home = actual_score_away) THEN
        RETURN 2;
    END IF;
    
    -- Žádná shoda - 0 bodů
    RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- Trigger pro automatické počítání bodů při vložení/aktualizaci výsledku
CREATE OR REPLACE FUNCTION update_tip_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Aktualizuj body pro všechny tipy daného zápasu
    INSERT INTO points (tip_id, points)
    SELECT 
        t.id,
        calculate_points(t.score_home, t.score_away, NEW.final_score_home, NEW.final_score_away)
    FROM tips t
    WHERE t.match_id = NEW.match_id
    ON CONFLICT (tip_id) 
    DO UPDATE SET points = EXCLUDED.points;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_result_update
    AFTER INSERT OR UPDATE ON results
    FOR EACH ROW
    EXECUTE FUNCTION update_tip_points();
