-- Zrušení původní policy
DROP POLICY IF EXISTS "Users can view their own tips" ON public.tips;

-- Nová policy pro zobrazení tipů
CREATE POLICY "View tips policy" ON public.tips
FOR SELECT USING (
  -- Uživatel může vidět své vlastní tipy kdykoliv
  auth.uid() = user_id 
  OR
  -- Ostatní tipy jsou viditelné až po začátku zápasu
  EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = tips.match_id
    AND matches.match_time <= NOW()
  )
);
