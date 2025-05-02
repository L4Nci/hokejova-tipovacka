-- Reset hesla pro admin uživatele
UPDATE auth.users
SET 
  encrypted_password = crypt('hovno', gen_salt('bf')),
  updated_at = now()
WHERE email = 'admin@example.com';

-- Výpis kontrolní zprávy
DO $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@example.com') INTO user_exists;
  
  IF user_exists THEN
    RAISE NOTICE 'Heslo pro admin@example.com bylo resetováno na "hovno"';
  ELSE
    RAISE NOTICE 'Uživatel admin@example.com nebyl nalezen!';
  END IF;
END;
$$;

-- Výpis existujícího admin uživatele (pro kontrolu)
SELECT u.id, u.email, p.username, p.role
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@example.com';
