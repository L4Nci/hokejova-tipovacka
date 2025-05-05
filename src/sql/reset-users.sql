-- Vypnutí RLS pro vyčištění
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- Vyčištění dat v bezpečném pořadí
BEGIN;
  -- Nejprve závislé tabulky
  DELETE FROM public.points;
  DELETE FROM public.tips;
  DELETE FROM public.profiles;
  -- Nakonec hlavní tabulka
  DELETE FROM auth.users;
COMMIT;

-- Znovu zapnutí RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
