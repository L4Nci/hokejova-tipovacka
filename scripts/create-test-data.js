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
    email: 'petr@test.cz',
    password: 'test123',
    username: 'Petr Novák',
    role: 'user'
  },
  {
    email: 'jana@test.cz',
    password: 'test123',
    username: 'Jana Malá',
    role: 'user'
  },
  {
    email: 'tomas@test.cz',
    password: 'test123',
    username: 'Tomáš Velký',
    role: 'user'
  }
];

const TEST_MATCHES = [
  {
    team_home: 'Česko',
    team_away: 'Slovensko',
    match_time: '2025-05-10T15:00:00',
    group_name: 'A',
    flag_home_url: 'https://flagcdn.com/w80/cz.png',
    flag_away_url: 'https://flagcdn.com/w80/sk.png'
  },
  {
    team_home: 'Finsko',
    team_away: 'Švédsko',
    match_time: '2025-05-10T19:00:00',
    group_name: 'B',
    flag_home_url: 'https://flagcdn.com/w80/fi.png',
    flag_away_url: 'https://flagcdn.com/w80/se.png'
  }
];

async function createTestData() {
  try {
    console.log('Začínám vytvářet testovací data...');

    // 1. Vytvoření uživatelů
    for (const user of TEST_USERS) {
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
          role: user.role
        });

      if (profileError) {
        console.error(`Chyba při vytváření profilu pro ${user.email}:`, profileError);
        continue;
      }

      console.log(`✓ Vytvořen uživatel: ${user.email}`);
    }

    // 2. Vytvoření zápasů
    const { error: matchesError } = await supabase
      .from('matches')
      .insert(TEST_MATCHES);

    if (matchesError) {
      throw matchesError;
    }

    console.log('✓ Vytvořeny testovací zápasy');
    console.log('Testovací data byla úspěšně vytvořena!');

  } catch (error) {
    console.error('Došlo k chybě:', error);
  }
}

// Spuštění skriptu
createTestData();
