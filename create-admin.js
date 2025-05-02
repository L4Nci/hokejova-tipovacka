import { createClient } from '@supabase/supabase-js';

// Nahraďte těmito hodnotami z vašeho projektu (nebo použijte .env)
const supabaseUrl = 'https://jgyleulajgfrgtpannyy.supabase.co';
const serviceRoleKey = 'SERVICE_ROLE_KEY'; // Najdeš v Project Settings > API > service_role key

// Vytvoř Supabase klienta se service_role klíčem (ne anon key!)
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createAdmin() {
  try {
    // 1. Vytvoř uživatele (autokonverze s admin právy)
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'silne_heslo',
      email_confirm: true, // Automaticky potvrdit email
      user_metadata: {
        username: 'Administrator'
      },
      role: 'admin'
    });

    if (userError) throw userError;

    console.log('Uživatelský účet vytvořen:', userData);
    const userId = userData.user.id;

    // 2. Vytvoř záznam v profiles tabulce
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: 'Administrator',
        role: 'admin',
      })
      .select();

    if (profileError) throw profileError;

    console.log('Profil vytvořen:', profileData);
    console.log('Admin účet úspěšně vytvořen!');

  } catch (error) {
    console.error('Chyba při vytváření admin účtu:', error);
  }
}

createAdmin();
