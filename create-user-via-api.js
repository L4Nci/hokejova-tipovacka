require('dotenv').config(); // Pokud používáte .env soubor
const { createClient } = require('@supabase/supabase-js');

// DŮLEŽITÉ: Pro toto potřebujete service_role klíč, ne anonymní klíč!
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Toto musíte přidat do .env

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createUser(email, password, username, role = 'user') {
  try {
    // 1. Vytvoření uživatele v auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // Automaticky potvrzený email
    });

    if (userError) throw userError;
    console.log('Uživatel vytvořen:', userData.user.id);

    // 2. Přidání záznamu do profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userData.user.id,
        username: username,
        role: role
      });

    if (profileError) throw profileError;
    console.log('Profil vytvořen pro uživatele:', username);
    
    return userData.user;
  } catch (error) {
    console.error('Chyba při vytváření uživatele:', error);
    throw error;
  }
}

// Příklad použití
async function main() {
  try {
    await createUser('novy@test.com', 'silneheslo123', 'Nový Tester');
    console.log('Uživatel úspěšně vytvořen!');
  } catch (error) {
    console.error('Vytvoření uživatele selhalo.');
  }
}

main();
