# SQL Skripty pro Hokejovou Tipovačku

Tato složka obsahuje SQL skripty pro inicializaci a správu databáze hokejové tipovačky.

## Způsoby spuštění skriptů

### 1. Supabase SQL Editor

Pro spuštění jednotlivých skriptů nebo jednorázových příkazů použijte SQL editor ve webovém rozhraní Supabase. 

**Důležité:** Příkazy `\i` nefungují v SQL editoru Supabase. Používejte místo toho `reload-database-all-in-one.sql`.

### 2. PostgreSQL klient (psql)

Pro spuštění skriptů v pořadí použijte `run-psql-import.bat`:

1. Upravte proměnné v souboru `run-psql-import.bat` (nastavte připojovací údaje)
2. Spusťte soubor `run-psql-import.bat` dvojklikem nebo z příkazového řádku

### 3. Node.js skript

Pro spuštění skriptů přímo z Node.js:

1. Nastavte proměnnou `SUPABASE_SERVICE_ROLE_KEY` ve vašem `.env` souboru
2. Spusťte:
   ```
   node execute-sql-script.js reload-database-all-in-one.sql
   ```

## Seznam skriptů

- `reload-database-all-in-one.sql` - Kompletní skript pro obnovení databáze (všechny příkazy v jednom souboru)
- `delete-test-data.sql` - Odstranění testovacích dat
- `fix-calculate-points-function.sql` - Oprava funkce pro výpočet bodů
- `fix-tips-triggers.sql` - Oprava triggerů pro tipy
- `fix-leaderboard-function.sql` - Oprava funkcí pro žebříčky
- `database-setup.sql` - Základní nastavení databáze
- `insert-test-data.sql` - Vložení testovacích dat

## Řešení problémů

### Chyba "cannot change return type of existing function"

Tento problém nastává při pokusu změnit návratový typ funkce. Řešení:

1. Spusťte skript `fix-calculate-points-function.sql`, který:
   - Odstraní existující trigger
   - Odstraní existující funkci
   - Vytvoří funkci s novým návratovým typem
   - Znovu vytvoří trigger

### Chyba při příkazech \i v SQL editoru

Příkazy `\i` jsou specifické pro klienta psql a nefungují v Supabase SQL editoru.
Místo toho použijte kompletní skript `reload-database-all-in-one.sql`.
