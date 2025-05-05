-- Reset a nastavení admin oprávnění
BEGIN;

-- 1. Nejprve odstraníme všechny existující policies
DROP POLICY IF EXISTS "Admin full access on matches" ON public.matches;
DROP POLICY IF EXISTS "Admin full access on tips" ON public.tips;
DROP POLICY IF EXISTS "Admin full access on results" ON public.results;
DROP POLICY IF EXISTS "Admin full access on profiles" ON public.profiles;

-- 2. Vytvoříme pomocnou funkci pro ověření admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Nastavíme základní oprávnění pro všechny tabulky
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Vytvoříme nové admin policies s širšími právy
CREATE POLICY "Admin matches access" ON public.matches
  FOR ALL
  TO authenticated
  USING (is_admin() OR TRUE)
  WITH CHECK (is_admin());

CREATE POLICY "Admin tips access" ON public.tips
  FOR ALL
  TO authenticated
  USING (is_admin() OR (auth.uid() = user_id))
  WITH CHECK (is_admin() OR (auth.uid() = user_id));

CREATE POLICY "Admin results access" ON public.results
  FOR ALL
  TO authenticated
  USING (is_admin() OR TRUE)
  WITH CHECK (is_admin());

CREATE POLICY "Admin profiles access" ON public.profiles
  FOR ALL
  TO authenticated
  USING (is_admin() OR (auth.uid() = id))
  WITH CHECK (is_admin() OR (auth.uid() = id));

-- 5. Explicitní grant oprávnění pro admin roli
GRANT ALL ON public.matches TO authenticated;
GRANT ALL ON public.tips TO authenticated;
GRANT ALL ON public.results TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- 6. Ověření nastavení
DO $$
BEGIN
  RAISE NOTICE 'Kontrola admin oprávnění...';
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('matches', 'tips', 'results', 'profiles')
  ) THEN
    RAISE EXCEPTION 'Policies nebyly správně vytvořeny!';
  END IF;
END $$;

COMMIT;

-- 7. Výpis aktuálních politik pro kontrolu
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
