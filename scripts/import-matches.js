import { createClient } from '@supabase/supabase-js';

const matches = [
  {
    team_home: "Česko",
    team_away: "Slovensko",
    match_time: "2025-05-10T15:00:00",
    group_name: "A",
    flag_home_url: "https://flagcdn.com/w80/cz.png",
    flag_away_url: "https://flagcdn.com/w80/sk.png"
  },
  // ...další zápasy
];

const importMatches = async () => {
  // Import logika
};
