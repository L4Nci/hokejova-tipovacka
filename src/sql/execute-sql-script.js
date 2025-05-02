// Skript pro spuštění SQL skriptu přímo z Node.js

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Načtení proměnných prostředí z .env souboru
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

// Argumenty příkazové řádky
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Použití: node execute-sql-script.js nazev_souboru.sql');
  process.exit(1);
}

const sqlFileName = args[0];
const sqlFilePath = path.resolve(__dirname, sqlFileName);

// Zkontrolujeme, zda soubor existuje
if (!fs.existsSync(sqlFilePath)) {
  console.error(`Soubor ${sqlFilePath} neexistuje.`);
  process.exit(1);
}

// Získání Supabase přístupových údajů z proměnných prostředí
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Chybí proměnné prostředí VITE_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Vytvoření Supabase klienta se service role klíčem
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSqlScript() {
  try {
    console.log(`Načítám SQL skript: ${sqlFileName}`);
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Spouštím SQL příkazy...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    });

    if (error) throw error;
    
    console.log('SQL skript úspěšně spuštěn!');
    if (data) console.log('Výsledek:', data);
  } catch (error) {
    console.error('Chyba při spouštění SQL skriptu:', error);
  }
}

executeSqlScript();
