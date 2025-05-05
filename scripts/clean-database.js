import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Důležité: použít service_role klíč!
);

async function cleanDatabase() {
  try {
    console.log('Začínám čištění databáze...');

    // 1. Vypnout RLS
    await supabase.rpc('disable_rls');

    // 2. Smazat všechny záznamy
    await supabase.from('tips').delete().neq('id', 0);
    await supabase.from('profiles').delete().neq('id', 0);
    
    // 3. Smazat auth uživatele
    const { data: users } = await supabase.auth.admin.listUsers();
    for (const user of users.users) {
      await supabase.auth.admin.deleteUser(user.id);
    }

    // 4. Zapnout RLS
    await supabase.rpc('enable_rls');

    console.log('Databáze vyčištěna!');
  } catch (error) {
    console.error('Chyba:', error);
  }
}

cleanDatabase();
