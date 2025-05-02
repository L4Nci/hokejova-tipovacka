-- Resetování přihlašovacích údajů administrátora
DO $$
DECLARE
  target_email TEXT := 'admin@example.com';
  admin_exists BOOLEAN;
BEGIN
  -- Nejprve ověříme, zda admin účet existuje
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = target_email) INTO admin_exists;
  
  IF NOT admin_exists THEN
    -- Vytvoříme nového administrátora, pokud neexistuje
    DECLARE
      new_admin_id UUID;
    BEGIN
      INSERT INTO auth.users (
        instance_id,
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        target_email,
        crypt('Testing123!', gen_salt('bf')), -- Silné heslo s číslem a speciálním znakem
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
        '{"username": "Viktor"}'::jsonb,
        now(),
        now(),
        '',
        '',
        '',
        ''
      ) RETURNING id INTO new_admin_id;
      
      -- Vytvoříme profil pro nového admina
      INSERT INTO public.profiles (
        id,
        username,
        role,
        created_at
      ) VALUES (
        new_admin_id,
        'Viktor',
        'admin',
        now()
      );
      
      RAISE NOTICE 'Nový admin účet vytvořen s ID: %', new_admin_id;
    END;
  ELSE
    -- Resetujeme heslo pro existující účet
    UPDATE auth.users
    SET 
      encrypted_password = crypt('Testing123!', gen_salt('bf')),
      email_confirmed_at = now(),
      updated_at = now()
    WHERE email = target_email;
    
    RAISE NOTICE 'Heslo pro % bylo resetováno na "Testing123!"', target_email;
  END IF;
END;
$$;

-- Pro kontrolu vypíšeme informace o admin účtu
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at IS NOT NULL AS is_confirmed,
  p.username,
  p.role
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@example.com';
