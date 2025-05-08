import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSystem() {
  console.log('🏁 Spouštím test bodovacího systému...');
  
  const { data, error } = await supabase.rpc('test_scoring_system');
  
  if (error) {
    console.error('❌ Test selhal:', error);
    return;
  }

  console.log('✅ Test proběhl úspěšně!');
  console.log('\nVýsledky:');
  console.log(JSON.stringify(data, null, 2));
}

testSystem();
