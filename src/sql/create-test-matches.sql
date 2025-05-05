-- Vytvořit testovací zápasy
INSERT INTO matches (id, team_home, team_away, flag_home_url, flag_away_url, match_time, group_name)
VALUES
  (gen_random_uuid(), 'Česko', 'Slovensko', '/flags/cze.png', '/flags/svk.png', NOW() + interval '1 day', 'A'),
  (gen_random_uuid(), 'Finsko', 'Švédsko', '/flags/fin.png', '/flags/swe.png', NOW() + interval '2 days', 'A'),
  (gen_random_uuid(), 'Kanada', 'USA', '/flags/can.png', '/flags/usa.png', NOW() + interval '3 days', 'B');
