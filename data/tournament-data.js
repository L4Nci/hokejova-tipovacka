export const TOURNAMENT_MATCHES = [
  // Skupina A – O2 Arena Praha
  { team_home: "Česko", team_away: "Finsko", match_time: "2025-05-10T20:15:00", group_name: "A", flag_home_url: "https://flagcdn.com/w80/cz.png", flag_away_url: "https://flagcdn.com/w80/fi.png", venue: "O2 Arena Praha" },
  // ... zde budou další zápasy

  // Skupina B – WERK Arena Třinec
  { team_home: "Kanada", team_away: "USA", match_time: "2025-05-10T16:20:00", group_name: "B", flag_home_url: "https://flagcdn.com/w80/ca.png", flag_away_url: "https://flagcdn.com/w80/us.png", venue: "WERK Arena Třinec" },
  // ... zde budou další zápasy
];

export const TOURNAMENT_GROUPS = {
  "A": ["Česko", "Finsko", "Švýcarsko", "Norsko", "Dánsko", "Rakousko", "Velká Británie", "Polsko"],
  "B": ["Kanada", "USA", "Švédsko", "Německo", "Slovensko", "Francie", "Lotyšsko", "Kazachstán"]
};

export const TOURNAMENT_VENUES = {
  "O2 Arena Praha": {
    city: "Praha",
    capacity: 17383
  },
  "WERK Arena Třinec": {
    city: "Třinec",
    capacity: 5400
  },
  "Avicii Arena": {
    city: "Stockholm",
    capacity: 13850
  },
  "Jyske Bank Boxen": {
    city: "Herning",
    capacity: 12000
  }
};

// Helper functions
export const getCountryCode = (country) => {
  const countryMap = {
    "Česko": "cz",
    "Finsko": "fi",
    "Švédsko": "se",
    "Kanada": "ca",
    "USA": "us",
    "Švýcarsko": "ch",
    "Slovensko": "sk",
    "Německo": "de",
    "Dánsko": "dk",
    "Norsko": "no",
    "Rakousko": "at",
    "Francie": "fr",
    "Lotyšsko": "lv",
    "Kazachstán": "kz",
    "Velká Británie": "gb",
    "Polsko": "pl",
    "Maďarsko": "hu"
  };
  return countryMap[country];
};

export const createMatch = (homeTeam, awayTeam, date, time, group, venue) => {
  const matchDateTime = `2025-${date}T${time}:00`;
  return {
    team_home: homeTeam,
    team_away: awayTeam,
    match_time: matchDateTime,
    group_name: group,
    flag_home_url: `https://flagcdn.com/w80/${getCountryCode(homeTeam)}.png`,
    flag_away_url: `https://flagcdn.com/w80/${getCountryCode(awayTeam)}.png`,
    venue: venue
  };
};
