import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TEST_USERS = [
  {
    email: 'admin@ms2025.cz',
    password: 'admin123',
    username: 'Administrator',
    role: 'admin'
  },
  {
    email: 'test1@ms2025.cz', // Změněné emaily
    password: 'test123',
    username: 'Test User 1',
    role: 'user'
  },
  {
    email: 'test2@ms2025.cz',
    password: 'test123', 
    username: 'Test User 2',
    role: 'user'
  }
];

async function createUsers() {
  for (const user of TEST_USERS) {
    try {
      console.log(`Vytvářím uživatele ${user.email}...`);
      
      // 1. Vytvořit auth uživatele
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirmed: true
      });

      if (authError) throw authError;

      // 2. Vytvořit profil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          username: user.username,
          role: user.role
        });

      if (profileError) throw profileError;

      console.log(`✓ Uživatel ${user.email} vytvořen`);

    } catch (error) {
      console.error(`Chyba pro ${user.email}:`, error.message);
    }
  }
}

createUsers();
