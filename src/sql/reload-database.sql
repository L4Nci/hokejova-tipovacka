-- Skript pro opětovné nahrání databáze ve správném pořadí

-- 1. Nejprve vyčistit databázi od testovacích dat
\i c:/Users/Viktor Landsman/Desktop/VISUAL STUDIO/MS-Hokej/src/sql/delete-test-data.sql

-- 2. Opravit funkci calculate_points, která způsobovala chybu
\i c:/Users/Viktor Landsman/Desktop/VISUAL STUDIO/MS-Hokej/src/sql/fix-calculate-points-function.sql

-- 3. Znovu vytvořit základní strukturu databáze
\i c:/Users/Viktor Landsman/Desktop/VISUAL STUDIO/MS-Hokej/src/sql/database-setup.sql

-- 4. Opravit trigger pro výpočet bodů
\i c:/Users/Viktor Landsman/Desktop/VISUAL STUDIO/MS-Hokej/src/sql/fix-tips-triggers.sql

-- 5. Vytvořit admin uživatele
\i c:/Users/Viktor Landsman/Desktop/VISUAL STUDIO/MS-Hokej/src/sql/create-admin-user.sql

-- 6. Vytvořit běžného uživatele
\i c:/Users/Viktor Landsman/Desktop/VISUAL STUDIO/MS-Hokej/src/sql/create-normal-user.sql

-- 7. Vylepšit žebříček
\i c:/Users/Viktor Landsman/Desktop/VISUAL STUDIO/MS-Hokej/src/sql/enhanced-leaderboard.sql

-- 8. Vložit testovací data
\i c:/Users/Viktor Landsman/Desktop/VISUAL STUDIO/MS-Hokej/src/sql/insert-test-data.sql

-- 9. Zkontrolovat databázi
DO $$
BEGIN
  RAISE NOTICE '------------------------------------';
  RAISE NOTICE 'Databáze byla úspěšně přenahrána';
  RAISE NOTICE '------------------------------------';
END;
$$;
