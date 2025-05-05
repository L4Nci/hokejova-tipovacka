BEGIN;
  -- Reset politik pro tipy
  DROP POLICY IF EXISTS "Enable read access for all users" ON public.tips;
  DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.tips;
  DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.tips;
  DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.tips;
  
  -- Základní čtení pro všechny autentizované uživatele
  CREATE POLICY "Enable read access for all users" 
  ON public.tips
  FOR SELECT 
  TO authenticated
  USING (true);
  
  -- Vkládání pro autentizované uživatele
  CREATE POLICY "Enable insert for authenticated users only" 
  ON public.tips
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM matches m 
      WHERE m.id = match_id 
      AND m.match_time > (now() + interval '5 minutes')
    )
  );
  
  -- Úpravy vlastních tipů
  CREATE POLICY "Enable update for users based on user_id" 
  ON public.tips
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM matches m 
      WHERE m.id = match_id 
      AND m.match_time > (now() + interval '5 minutes')
    )
  )
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM matches m 
      WHERE m.id = match_id 
      AND m.match_time > (now() + interval '5 minutes')
    )
  );

  -- Odstranění vlastních tipů
  CREATE POLICY "Enable delete for users based on user_id" 
  ON public.tips
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

  -- Zapnout RLS
  ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
COMMIT;
