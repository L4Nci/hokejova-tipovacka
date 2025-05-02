-- Vytvoření testovacích uživatelských účtů
DO $$
DECLARE
  user1_id UUID;
  user2_id UUID;
BEGIN
  -- ČÁST 1: První uživatel - jednodušší přihlašovací údaje
  INSERT INTO auth.users (
    instance_id,
    id,
    email,
    encrypted_password,
    email_confirmed_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'test@test.com',  -- Jednodušší email
    crypt('test123', gen_salt('bf')),  -- Jednodušší heslo
    now()
  ) RETURNING id INTO user1_id;

  -- Profil pro prvního uživatele
  INSERT INTO public.profiles (
    id,
    username,
    role
  ) VALUES (
    user1_id,
    'Tester',
    'user'
  );

  -- ČÁST 2: Druhý uživatel
  INSERT INTO auth.users (
    instance_id,
    id,
    email,
    encrypted_password,
    email_confirmed_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'test2@test.com',  -- Jednodušší email
    crypt('test123', gen_salt('bf')),  -- Stejné heslo pro snadné testování
    now()
  ) RETURNING id INTO user2_id;

  -- Profil pro druhého uživatele
  INSERT INTO public.profiles (
    id,
    username,
    role
  ) VALUES (
    user2_id,
    'Tester2',
    'user'
  );

  -- Výpis vytvořených ID pro kontrolu
  RAISE NOTICE 'Test uživatel 1 vytvořen s ID: %, email: test@test.com, heslo: test123', user1_id;
  RAISE NOTICE 'Test uživatel 2 vytvořen s ID: %, email: test2@test.com, heslo: test123', user2_id;
END;
$$;
