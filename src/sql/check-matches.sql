SELECT 
  id,
  team_home,
  team_away,
  match_time,
  flag_home_url,
  flag_away_url
FROM matches 
WHERE match_time >= NOW()
ORDER BY match_time
LIMIT 5;
