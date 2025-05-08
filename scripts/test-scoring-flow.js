import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const testScoringFlow = async () => {
  try {
    console.log('🏁 Začínám test bodovacího systému...');

    // Nejdřív se přihlásíme jako admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD
    });

    if (authError) {
      throw new Error('Nepodařilo se přihlásit: ' + authError.message);
    }

    // Pak spustíme test
    const { data, error } = await supabase.rpc('test_scoring_system');

    if (error) {
      throw error;
    }

    console.log('✨ Test úspěšně dokončen!');
    console.log('\n📊 Výsledky testu:');
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Test selhal:', error);
  }
};

testScoringFlow();
