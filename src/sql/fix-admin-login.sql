-- Reset a oprava admin účtu
DO $$
BEGIN
  -- 1. Reset hesla
  UPDATE auth.users 
  SET encrypted_password = crypt('admin123', gen_salt('bf')),
      email_confirmed_at = NOW(),
      raw_app_meta_data = '{"provider":"email","providers":["email"]}',
      raw_user_meta_data = '{"username":"Administrator"}'
  WHERE email = 'admin@ms2025.cz';

  -- 2. Ověření/oprava profilu
  INSERT INTO public.profiles (id, username, role)
  SELECT id, 'Administrator', 'admin'
  FROM auth.users
  WHERE email = 'admin@ms2025.cz'
  ON CONFLICT (id) DO UPDATE
  SET username = 'Administrator',
      role = 'admin';

  -- 3. Ověření práv
  UPDATE auth.users
  SET role = 'authenticated'
  WHERE email = 'admin@ms2025.cz';
END $$;
