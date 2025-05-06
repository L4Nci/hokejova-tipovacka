import { createClient } from '@supabase/supabase-js';
import { TOURNAMENT_MATCHES } from '../data/tournament-data.js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Důležité: Používáme service_role klíč
);

async function importTournamentData() {
  try {
    console.log('Začínám import turnajových dat...');

    // Kontrola připojení
    const { data: testData, error: testError } = await supabase
      .from('matches')
      .select('count');

    if (testError) {
      console.error('Test připojení selhal:', testError);
      return;
    }

    console.log('Připojení k databázi úspěšné');

    // Import dat
    const { error } = await supabase
      .from('matches')
      .upsert(TOURNAMENT_MATCHES, {
        onConflict: 'team_home,team_away,match_time',
        ignoreDuplicates: true
      });

    if (error) throw error;

    console.log(`Import dokončen! Importováno ${TOURNAMENT_MATCHES.length} zápasů.`);
  } catch (error) {
    console.error('Chyba při importu:', error);
  }
}

importTournamentData();
