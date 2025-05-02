-- Skript pro odstranění testovacích dat z databáze

-- Odstraní data v pořadí respektujícím referenční integritu
DO $$
BEGIN
  -- Smazání záznamů z tabulek v bezpečném pořadí (kvůli cizím klíčům)
  DELETE FROM public.points;
  DELETE FROM public.results;
  DELETE FROM public.tips;
  DELETE FROM public.matches;
  
  -- Zachováme profily uživatelů, ale ne jejich tipy
  RAISE NOTICE 'Testovací data byla odstraněna';
END;
$$;
