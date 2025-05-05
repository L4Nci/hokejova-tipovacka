import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapování správných URL vlajek
const flagURLs = {
  'Česko': 'https://flagcdn.com/w80/cz.png',
  'Slovensko': 'https://flagcdn.com/w80/sk.png',
  'Finsko': 'https://flagcdn.com/w80/fi.png',
  'Švédsko': 'https://flagcdn.com/w80/se.png',
  'Kanada': 'https://flagcdn.com/w80/ca.png',
  'USA': 'https://flagcdn.com/w80/us.png',
  'Švýcarsko': 'https://flagcdn.com/w80/ch.png',
  'Německo': 'https://flagcdn.com/w80/de.png',
  'Dánsko': 'https://flagcdn.com/w80/dk.png',
  'Norsko': 'https://flagcdn.com/w80/no.png',
  'Rakousko': 'https://flagcdn.com/w80/at.png',
  'Francie': 'https://flagcdn.com/w80/fr.png',
  'Lotyšsko': 'https://flagcdn.com/w80/lv.png',
  'Kazachstán': 'https://flagcdn.com/w80/kz.png',
  'Velká Británie': 'https://flagcdn.com/w80/gb.png',
  'Polsko': 'https://flagcdn.com/w80/pl.png'
};

async function updateFlags() {
  try {
    // Načíst všechny zápasy
    const { data: matches, error: fetchError } = await supabase
      .from('matches')
      .select('*');

    if (fetchError) throw fetchError;

    // Projít všechny zápasy a aktualizovat URL vlajek
    for (const match of matches) {
      const homeFlag = flagURLs[match.team_home];
      const awayFlag = flagURLs[match.team_away];

      if (homeFlag && awayFlag) {
        const { error: updateError } = await supabase
          .from('matches')
          .update({
            flag_home_url: homeFlag,
            flag_away_url: awayFlag
          })
          .eq('id', match.id);

        if (updateError) {
          console.error(`Chyba při aktualizaci zápasu ${match.id}:`, updateError);
          continue;
        }

        console.log(`Aktualizovány vlajky pro zápas ${match.id}: ${match.team_home} vs ${match.team_away}`);
      } else {
        console.warn(`Nenalezeny URL vlajek pro zápas ${match.id}: ${match.team_home} vs ${match.team_away}`);
      }
    }

    console.log('Aktualizace vlajek dokončena!');
  } catch (error) {
    console.error('Chyba při aktualizaci vlajek:', error);
  }
}

updateFlags();
