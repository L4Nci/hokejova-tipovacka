-- Test databázového schématu a nastavení
-- Spustit pro ověření, že vše je správně nastaveno

-- 1. Kontrola existence tabulek
SELECT 
  EXISTS(SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') AS "profiles_exists",
  EXISTS(SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'matches') AS "matches_exists",
  EXISTS(SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tips') AS "tips_exists",
  EXISTS(SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'results') AS "results_exists",
  EXISTS(SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'points') AS "points_exists";

-- 2. Kontrola počtu záznamů v tabulkách
SELECT 
  (SELECT COUNT(*) FROM auth.users) AS "pocet_uzivatelu",
  (SELECT COUNT(*) FROM public.profiles) AS "pocet_profilu",
  (SELECT COUNT(*) FROM public.matches) AS "pocet_zapasu",
  (SELECT COUNT(*) FROM public.tips) AS "pocet_tipu",
  (SELECT COUNT(*) FROM public.results) AS "pocet_vysledku",
  (SELECT COUNT(*) FROM public.points) AS "pocet_bodu";

-- 3. Kontrola existujících rolí v systému
SELECT username, role FROM public.profiles;

-- 4. Kontrola existence triggerů pro výpočet bodů
SELECT 
  tgname AS "nazev_triggeru",
  tgrelid::regclass AS "tabulka",
  pg_get_triggerdef(oid) AS "definice_triggeru"
FROM pg_trigger
WHERE tgname LIKE '%calculate%';
