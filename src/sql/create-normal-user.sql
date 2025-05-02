-- Vytvoření běžného uživatele s přístupem k tipování
DO $$
DECLARE 
  user_id UUID;
BEGIN
  -- Část 1: Vytvoření uživatelského účtu v auth.users a získání jeho ID
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    password_hash,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_sent_at,
    email_confirmed_at,
    recovery_sent_at,
    email_change_sent_at,
    reauthentication_sent_at
  ) VALUES (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000000',
    'user@example.com',
    crypt('hokej2025', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"username": "Tipař"}'::jsonb,  -- Uživatelské jméno
    now(),
    now()
  ) RETURNING id INTO user_id;

  -- Část 2: Vytvoření záznamu v profiles tabulce s ID z předchozího kroku
  INSERT INTO public.profiles (
    id,
    username,
    role,
    created_at
  ) VALUES (
    user_id,
    'Tipař',  -- Uživatelské jméno
    'user',   -- Role (běžný uživatel)
    now()
  );

  -- Výpis vytvořeného ID pro kontrolu
  RAISE NOTICE 'Běžný uživatel úspěšně vytvořen s ID: %', user_id;
  RAISE NOTICE 'Přihlašovací údaje: user@example.com / hokej2025';
END;
$$;
