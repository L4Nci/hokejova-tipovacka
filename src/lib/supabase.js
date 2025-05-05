import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials!', {
    url: !!supabaseUrl,
    key: !!supabaseKey
  });
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false // vypneme default redirect handling
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Debug helper
export const checkAuth = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  console.log('Current auth state:', {
    authenticated: !!session,
    error: error?.message
  });
  return session;
};
