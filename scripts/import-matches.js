require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mapování vlajek pro všechny týmy
const FLAG_URLS = {
  'Rakousko': 'https://flagcdn.com/w80/at.png',
  'Finsko': 'https://flagcdn.com/w80/fi.png',
  'Švédsko': 'https://flagcdn.com/w80/se.png',
  'Slovensko': 'https://flagcdn.com/w80/sk.png',
  'Švýcarsko': 'https://flagcdn.com/w80/ch.png',
  'Česko': 'https://flagcdn.com/w80/cz.png',
  'Dánsko': 'https://flagcdn.com/w80/dk.png',
  'USA': 'https://flagcdn.com/w80/us.png',
  'Slovinsko': 'https://flagcdn.com/w80/si.png',
  'Kanada': 'https://flagcdn.com/w80/ca.png',
  'Norsko': 'https://flagcdn.com/w80/no.png',
  'Kazachstán': 'https://flagcdn.com/w80/kz.png',
  'Německo': 'https://flagcdn.com/w80/de.png',
  'Maďarsko': 'https://flagcdn.com/w80/hu.png',
  'Francie': 'https://flagcdn.com/w80/fr.png',
  'Lotyšsko': 'https://flagcdn.com/w80/lv.png'
};

const data = `Datum	Čas	Skupina	Místo konání	Tým 1	Tým 2
// ...existing data...`;

async function importMatches() {
  const matches = data.split('\n').slice(1).map(line => {
    const [date, time, group, venue, team1, team2] = line.split('\t');
    const [day, month, year] = date.split('.');
    const [hours, minutes] = time.split(':');
    const match_time = new Date(year, month - 1, day, hours, minutes);

    return {
      match_time: match_time.toISOString(),
      group_name: group,
      venue,
      team_home: team1,
      team_away: team2,
      flag_home_url: FLAG_URLS[team1],
      flag_away_url: FLAG_URLS[team2],
      is_finished: false,
      final_score_home: null,
      final_score_away: null
    };
  });

  try {
    console.log('Začínám import zápasů...');
    
    const { data, error } = await supabase
      .from('matches')
      .upsert(matches, {
        onConflict: 'team_home,team_away,match_time',
        ignoreDuplicates: false
      });

    if (error) throw error;

    console.log(`Úspěšně importováno ${matches.length} zápasů!`);
  } catch (error) {
    console.error('Chyba při importu:', error);
  }
}

importMatches();
