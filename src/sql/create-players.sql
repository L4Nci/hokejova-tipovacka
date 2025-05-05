-- Vyčištění a reset tabulek
DELETE FROM public.profiles;
DELETE FROM auth.users;

-- Reset RLS
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Admin účet s náhodným UUID
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  ) VALUES (
    gen_random_uuid(),  -- Generování náhodného UUID
    'admin@ms2025.cz',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('username', 'Administrator'),
    'authenticated',
    'authenticated'
  ) 
  RETURNING id INTO user_id;  -- Uložení vygenerovaného ID

  -- Admin profil s vráceným ID
  INSERT INTO profiles (id, username, role)
  VALUES (user_id, 'Administrator', 'admin');

  -- Běžní uživatelé
  FOR i IN 1..8 LOOP
    -- Vložení uživatele s náhodným UUID
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      gen_random_uuid(),  -- Generování náhodného UUID
      format('hrac%s@ms2025.cz', i),
      crypt('heslo123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object(
        'username', 
        CASE 
          WHEN i = 1 THEN 'Viktor'
          WHEN i = 2 THEN 'Pavel'
          WHEN i = 3 THEN 'Martin'
          WHEN i = 4 THEN 'Tomáš'
          WHEN i = 5 THEN 'Jan'
          WHEN i = 6 THEN 'Petr'
          WHEN i = 7 THEN 'Marek'
          WHEN i = 8 THEN 'David'
        END
      ),
      'authenticated',
      'authenticated'
    )
    RETURNING id INTO user_id;  -- Uložení vygenerovaného ID

    IF user_id IS NOT NULL THEN
      INSERT INTO profiles (id, username, role)
      VALUES (
        user_id,
        CASE 
          WHEN i = 1 THEN 'Viktor'
          WHEN i = 2 THEN 'Pavel'
          WHEN i = 3 THEN 'Martin'
          WHEN i = 4 THEN 'Tomáš'
          WHEN i = 5 THEN 'Jan'
          WHEN i = 6 THEN 'Petr'
          WHEN i = 7 THEN 'Marek'
          WHEN i = 8 THEN 'David'
        END,
        'user'
      );
    END IF;
  END LOOP;
END $$;

-- Obnovení RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Kontrola
SELECT 
  au.email,
  au.email_confirmed_at,
  p.username,
  p.role
FROM auth.users au
JOIN profiles p ON au.id = p.id
ORDER BY au.email;
