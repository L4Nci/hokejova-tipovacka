-- Resetování hesla admin účtu
-- Tento skript přímo nastaví nové heslo pro admin@example.com

DO $$
DECLARE
  target_email TEXT := 'admin@example.com';
  user_exists BOOLEAN;
BEGIN
  -- Kontrola, zda uživatel existuje
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = target_email) INTO user_exists;
  
  IF NOT user_exists THEN
    RAISE EXCEPTION 'Uživatel s emailem % nebyl nalezen', target_email;
  END IF;
  
  -- Resetování hesla
  UPDATE auth.users
  SET 
    encrypted_password = crypt('hovno', gen_salt('bf')),
    last_sign_in_at = now(),
    updated_at = now()
  WHERE email = target_email;
  
  -- Vypíšeme potvrzení
  RAISE NOTICE 'Heslo pro uživatele % bylo úspěšně resetováno na "hovno"', target_email;
END;
$$;

-- Kontrola, zda byl uživatel správně aktualizován
SELECT id, email, email_confirmed_at, last_sign_in_at 
FROM auth.users 
WHERE email = 'admin@example.com';
