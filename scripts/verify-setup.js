import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifySetup() {
  try {
    console.log('Verifying Supabase setup...');

    // 1. Check connection
    const { data: health } = await supabase.rpc('test_auth');
    console.log('Auth health:', health);

    // 2. Try to create test login
    const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@ms2025.cz',
      password: 'admin123'
    });

    console.log('Auth test result:', { auth, error: authError });

    // 3. Check policies
    const { data: policies } = await supabase
      .from('profiles')
      .select('role')
      .eq('username', 'Administrator')
      .single();

    console.log('Admin profile:', policies);

  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verifySetup();
