-- Zobrazení výsledků testů bodování
SELECT 
  m.team_home, 
  m.team_away,
  m.match_time,
  r.final_score_home, 
  r.final_score_away,
  p.username,
  t.score_home AS tip_home,
  t.score_away AS tip_away,
  pts.points,
  CASE 
    WHEN t.score_home = r.final_score_home AND t.score_away = r.final_score_away THEN 'Přesný výsledek (5 bodů)'
    WHEN (t.score_home > t.score_away AND r.final_score_home > r.final_score_away) OR
         (t.score_home < t.score_away AND r.final_score_home < r.final_score_away) OR
         (t.score_home = t.score_away AND r.final_score_home = r.final_score_away) THEN 'Správný vítěz (2 body)'
    ELSE 'Špatný tip (0 bodů)'
  END AS explanation
FROM 
  public.matches m
JOIN 
  public.results r ON m.id = r.match_id
JOIN 
  public.tips t ON m.id = t.match_id
JOIN 
  public.profiles p ON t.user_id = p.id
LEFT JOIN 
  public.points pts ON pts.match_id = m.id AND pts.user_id = t.user_id
ORDER BY
  m.match_time DESC;

-- Případně najít pouze záznamy pro konkrétního uživatele
-- SELECT 
--   m.team_home, 
--   m.team_away,
--   m.match_time,
--   r.final_score_home, 
--   r.final_score_away,
--   p.username,
--   t.score_home AS tip_home,
--   t.score_away AS tip_away,
--   pts.points
-- FROM 
--   public.matches m
-- JOIN 
--   public.results r ON m.id = r.match_id
-- JOIN 
--   public.tips t ON m.id = t.match_id
-- JOIN 
--   public.profiles p ON t.user_id = p.id
-- LEFT JOIN 
--   public.points pts ON pts.match_id = m.id AND pts.user_id = t.user_id
-- WHERE 
--   p.username = 'Tester'
-- ORDER BY
--   m.match_time DESC;
