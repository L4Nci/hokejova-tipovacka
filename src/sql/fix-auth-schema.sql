-- Kompletní reset a oprava admin účtu
BEGIN;
  -- 1. Vypnout constrainty
  SET session_replication_role = 'replica';

  -- 2. Vyčistit všechny závislosti
  DELETE FROM auth.users CASCADE;
  DELETE FROM public.profiles CASCADE;
  
  -- 3. Vytvořit nového admin uživatele
  WITH new_admin AS (
    INSERT INTO auth.users (
      id,                    -- Přidáno
      instance_id,          -- Přidáno
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      gen_random_uuid(),    -- Generování UUID
      '00000000-0000-0000-0000-000000000000',  -- Default instance ID
      'admin@ms2025.cz',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,  -- Přidána role do metadat
      '{"username":"Administrator"}'::jsonb,
      'authenticated',
      'authenticated'
    )
    RETURNING id
  )
  INSERT INTO public.profiles (id, username, role)
  SELECT id, 'Administrator', 'admin'
  FROM new_admin;

  -- 4. Zapnout constrainty
  SET session_replication_role = 'origin';
COMMIT;

-- 5. Ověření vytvoření účtu
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at IS NOT NULL as is_email_confirmed,
  u.encrypted_password IS NOT NULL as has_password,
  u.raw_app_meta_data,
  p.role
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@ms2025.cz';
