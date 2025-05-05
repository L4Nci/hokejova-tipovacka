INSERT INTO results (match_id, final_score_home, final_score_away)
VALUES 
  ('zde-vlož-id-zápasu', 3, 2)  -- příklad výsledku 3:2
ON CONFLICT (match_id) 
DO UPDATE SET 
  final_score_home = EXCLUDED.final_score_home,
  final_score_away = EXCLUDED.final_score_away;
