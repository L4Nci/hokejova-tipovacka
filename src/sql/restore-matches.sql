-- Vložení všech zápasů MS 2025
INSERT INTO matches (id, team_home, team_away, flag_home_url, flag_away_url, match_time, group_name)
VALUES
  -- Základní skupina A (každý s každým, 28 zápasů)
  (gen_random_uuid(), 'Česko', 'Finsko', 'https://flagcdn.com/cz.svg', 'https://flagcdn.com/fi.svg', '2025-05-09 16:20:00+02', 'A'),
  (gen_random_uuid(), 'Švédsko', 'Kanada', 'https://flagcdn.com/se.svg', 'https://flagcdn.com/ca.svg', '2025-05-09 20:20:00+02', 'A'),
  (gen_random_uuid(), 'Česko', 'Švédsko', 'https://flagcdn.com/cz.svg', 'https://flagcdn.com/se.svg', '2025-05-10 12:20:00+02', 'A'),
  (gen_random_uuid(), 'Finsko', 'Kanada', 'https://flagcdn.com/fi.svg', 'https://flagcdn.com/ca.svg', '2025-05-10 16:20:00+02', 'A'),
  (gen_random_uuid(), 'Švédsko', 'Finsko', 'https://flagcdn.com/se.svg', 'https://flagcdn.com/fi.svg', '2025-05-11 16:20:00+02', 'A'),
  (gen_random_uuid(), 'Kanada', 'Česko', 'https://flagcdn.com/ca.svg', 'https://flagcdn.com/cz.svg', '2025-05-11 20:20:00+02', 'A'),
  -- Přidej dalších 22 zápasů skupiny A...

  -- Základní skupina B (každý s každým, 28 zápasů)
  (gen_random_uuid(), 'USA', 'Německo', 'https://flagcdn.com/us.svg', 'https://flagcdn.com/de.svg', '2025-05-09 16:20:00+02', 'B'),
  (gen_random_uuid(), 'Slovensko', 'Švýcarsko', 'https://flagcdn.com/sk.svg', 'https://flagcdn.com/ch.svg', '2025-05-09 20:20:00+02', 'B'),
  (gen_random_uuid(), 'USA', 'Slovensko', 'https://flagcdn.com/us.svg', 'https://flagcdn.com/sk.svg', '2025-05-10 12:20:00+02', 'B'),
  (gen_random_uuid(), 'Německo', 'Švýcarsko', 'https://flagcdn.com/de.svg', 'https://flagcdn.com/ch.svg', '2025-05-10 16:20:00+02', 'B'),
  (gen_random_uuid(), 'Slovensko', 'Německo', 'https://flagcdn.com/sk.svg', 'https://flagcdn.com/de.svg', '2025-05-11 16:20:00+02', 'B'),
  (gen_random_uuid(), 'Švýcarsko', 'USA', 'https://flagcdn.com/ch.svg', 'https://flagcdn.com/us.svg', '2025-05-11 20:20:00+02', 'B'),
  -- Přidej dalších 22 zápasů skupiny B...

  -- Play-off (14 zápasů)
  -- Čtvrtfinále
  (gen_random_uuid(), 'A1', 'B4', 'https://flagcdn.com/placeholder.svg', 'https://flagcdn.com/placeholder.svg', '2025-05-22 16:20:00+02', 'P'),
  (gen_random_uuid(), 'B2', 'A3', 'https://flagcdn.com/placeholder.svg', 'https://flagcdn.com/placeholder.svg', '2025-05-22 20:20:00+02', 'P'),
  -- Přidej zbývající čtvrtfinále, semifinále a finále...
  (gen_random_uuid(), 'TBD', 'TBD', 'https://flagcdn.com/placeholder.svg', 'https://flagcdn.com/placeholder.svg', '2025-05-25 20:20:00+02', 'P');
