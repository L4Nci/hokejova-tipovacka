import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function forceDeleteAdmin() {
  try {
    console.log('Začínám mazání admin účtu...');

    // 1. Vypnout RLS a constrainty
    await supabase.rpc('disable_rls');
    
    // 2. Najít ID admina
    const { data: users } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', 'admin@ms2025.cz')
      .single();

    if (users?.id) {
      // 3. Smazat všechny související záznamy
      await supabase.from('tips').delete().eq('user_id', users.id);
      await supabase.from('profiles').delete().eq('id', users.id);
      
      // 4. Smazat auth záznam
      await supabase.auth.admin.deleteUser(users.id);
      
      console.log('Admin účet úspěšně smazán');
    } else {
      console.log('Admin účet nenalezen');
    }

    // 5. Zapnout RLS
    await supabase.rpc('enable_rls');

  } catch (error) {
    console.error('Chyba při mazání:', error);
  }
}

forceDeleteAdmin();
