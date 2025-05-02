import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Chybí Supabase proměnné prostředí! Zkontrolujte .env soubor.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Testovací funkce pro ověření připojení
export const testConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('count');
    if (error) {
      console.error('Chyba připojení k Supabase:', error);
      return false;
    }
    console.log('Připojení k Supabase je funkční');
    return true;
  } catch (err) {
    console.error('Neočekávaná chyba při připojení k Supabase:', err);
    return false;
  }
};
