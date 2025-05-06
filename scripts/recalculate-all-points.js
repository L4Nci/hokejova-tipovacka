import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function recalculateAllPoints() {
  try {
    console.log('Začínám přepočet bodů...');

    // 1. Načteme všechny zápasy s výsledky a jejich tipy
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(`
        id,
        final_score_home,
        final_score_away,
        tips (
          id,
          score_home,
          score_away
        )
      `)
      .not('final_score_home', 'is', null)
      .not('final_score_away', 'is', null);

    if (matchesError) throw matchesError;
    console.log(`Načteno ${matches.length} zápasů`);

    // 2. Pro každý tip přepočítáme body
    for (const match of matches) {
      if (!match.tips) continue;

      for (const tip of match.tips) {
        let points = 0;
        let isExactScore = false;
        let isCorrectWinner = false;

        // Přesný výsledek = 5 bodů
        if (tip.score_home === match.final_score_home && 
            tip.score_away === match.final_score_away) {
          points = 5;
          isExactScore = true;
          isCorrectWinner = true;
        }
        // Správný vítěz = 2 body
        else if (
          (tip.score_home > tip.score_away && match.final_score_home > match.final_score_away) ||
          (tip.score_home < tip.score_away && match.final_score_home < match.final_score_away)
        ) {
          points = 2;
          isCorrectWinner = true;
        }

        // Aktualizace konkrétního tipu
        const { error: updateError } = await supabase
          .from('tips')
          .update({
            points,
            is_exact_score: isExactScore,
            is_correct_winner: isCorrectWinner
          })
          .eq('id', tip.id); // Důležité: aktualizujeme podle ID tipu

        if (updateError) {
          console.error(`Chyba při aktualizaci tipu ${tip.id}:`, updateError);
        }
      }
    }

    console.log('Přepočet bodů dokončen!');
  } catch (error) {
    console.error('Chyba při přepočtu:', error);
  }
}

// Spustíme přepočet
recalculateAllPoints();
