require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Seznam uživatelů, které chceme zachovat
const USERS_TO_CREATE = [
  {
    email: 'admin@example.com',
    password: 'silneheslo123',
    username: 'Administrator',
    role: 'admin'
  },
  // Tady přidej další uživatele...
];

async function resetUsers() {
  try {
    console.log('Začínám reset uživatelů...');

    // 1. Nejdřív smažeme všechny existující záznamy
    console.log('Mažu všechny tipy...');
    await supabase.from('tips').delete().neq('id', 0);
    
    console.log('Mažu všechny profily...');
    await supabase.from('profiles').delete().neq('id', 0);

    console.log('Mažu všechny uživatele...');
    const { data: users } = await supabase.auth.admin.listUsers();
    for (const user of users.users) {
      await supabase.auth.admin.deleteUser(user.id);
    }

    // 2. Vytvoříme nové uživatele
    console.log('Vytvářím nové uživatele...');
    for (const user of USERS_TO_CREATE) {
      // Vytvoření auth uživatele
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirmed: true,
        user_metadata: { username: user.username }
      });

      if (authError) {
        console.error(`Chyba při vytváření uživatele ${user.email}:`, authError);
        continue;
      }

      // Vytvoření profilu
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          username: user.username,
          role: user.role || 'user'
        });

      if (profileError) {
        console.error(`Chyba při vytváření profilu pro ${user.email}:`, profileError);
        continue;
      }

      console.log(`Úspěšně vytvořen uživatel: ${user.email}`);
    }

    console.log('Reset uživatelů dokončen!');

  } catch (error) {
    console.error('Došlo k chybě:', error);
  }
}

// Spuštění scriptu
resetUsers();
