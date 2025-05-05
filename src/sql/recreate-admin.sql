-- Vypnout foreign key kontroly
SET session_replication_role = 'replica';

DO $$
BEGIN
  -- Nejprve vyčistit existující data
  DELETE FROM auth.users WHERE email = 'admin@ms2025.cz';
  DELETE FROM public.profiles WHERE username = 'Administrator';
  
  -- Vytvořit nového admin uživatele s explicitním UUID
  WITH new_user AS (
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      created_at
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'admin@ms2025.cz',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"Administrator"}',
      'authenticated',
      'authenticated',
      now()
    )
    RETURNING id
  )
  -- Vytvořit odpovídající profil
  INSERT INTO public.profiles (
    id, 
    username, 
    role,
    created_at
  )
  SELECT 
    id,
    'Administrator',
    'admin',
    now()
  FROM new_user;
END $$;

-- Zapnout foreign key kontroly
SET session_replication_role = 'origin';

-- Ověření vytvoření
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  au.encrypted_password IS NOT NULL as has_password,
  au.raw_app_meta_data,
  au.raw_user_meta_data,
  p.username,
  p.role,
  p.created_at
FROM auth.users au
JOIN public.profiles p ON au.id = p.id
WHERE au.email = 'admin@ms2025.cz';

-- Ověření constraint a relací
SELECT conname, contype, conrelid::regclass
FROM pg_constraint
WHERE conrelid = 'auth.users'::regclass 
   OR conrelid = 'public.profiles'::regclass;
