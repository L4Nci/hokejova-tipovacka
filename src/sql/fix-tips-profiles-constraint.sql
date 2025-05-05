-- Fix for foreign key constraint violation between tips and profiles

-- First, let's identify any orphaned tips
SELECT DISTINCT t.user_id
FROM public.tips t
LEFT JOIN public.profiles p ON t.user_id = p.id
WHERE p.id IS NULL;

-- Create missing profiles for users that have tips but no profile
INSERT INTO public.profiles (id, username, role)
SELECT DISTINCT t.user_id, 
       COALESCE(u.raw_user_meta_data->>'username', 'User_' || substr(t.user_id::text, 1, 8)),
       'user'
FROM public.tips t
LEFT JOIN public.profiles p ON t.user_id = p.id
LEFT JOIN auth.users u ON t.user_id = u.id
WHERE p.id IS NULL;

-- Remove any tips that still have invalid user_ids (optional, uncomment if needed)
-- DELETE FROM public.tips 
-- WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- Add deferrable constraint to make transactions easier
ALTER TABLE public.tips DROP CONSTRAINT IF EXISTS fk_tips_profiles;
ALTER TABLE public.tips ADD CONSTRAINT fk_tips_profiles 
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE
    DEFERRABLE INITIALLY DEFERRED;

DO $$
DECLARE
  created_id UUID;
BEGIN
  -- Vložení nebo aktualizace testovacího profilu
  WITH ins AS (
    INSERT INTO public.profiles (id, username, role)
    VALUES (
      'd431168f-df4a-4597-8e9d-ab6b45c58517',  -- použij konkrétní ID místo gen_random_uuid()
      'Tester',
      'tester'
    )
    ON CONFLICT (username) DO UPDATE 
    SET role = 'tester'
    RETURNING id
  )
  SELECT id INTO created_id FROM ins;

  -- Kontrolní výpis
  RAISE NOTICE 'Vytvořen/aktualizován profil s ID: %', created_id;
END;
$$;
