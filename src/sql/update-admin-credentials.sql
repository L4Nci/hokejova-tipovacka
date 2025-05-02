-- Aktualizace admin uživatele pro přihlašování jménem a heslem
DO $$
DECLARE
  admin_email TEXT := 'admin@example.com';  -- Původní email admin účtu
  admin_id UUID;
BEGIN
  -- Získání ID admin uživatele
  SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;
  
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin uživatel s emailem % nenalezen', admin_email;
  END IF;

  -- 1. Aktualizace hesla a přihlašovacích údajů
  UPDATE auth.users
  SET 
    encrypted_password = crypt('hovno', gen_salt('bf')),
    raw_user_meta_data = jsonb_set(raw_user_meta_data, '{username}', '"Viktor"'),
    updated_at = now()
  WHERE id = admin_id;

  -- 2. Aktualizace profilu v profiles tabulce
  UPDATE public.profiles
  SET 
    username = 'Viktor'
  WHERE id = admin_id;
  
  RAISE NOTICE 'Admin uživatel byl aktualizován!';
  RAISE NOTICE 'Email: %', admin_email;
  RAISE NOTICE 'Jméno: Viktor';
  RAISE NOTICE 'Heslo: hovno';
END;
$$;
