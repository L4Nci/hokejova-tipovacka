-- Vytvoření admin uživatele v jednom transakčním bloku
DO $$
DECLARE
  admin_id UUID;
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
    'admin@example.com',
    crypt('silne_heslo', gen_salt('bf')),  -- Zde změnit heslo
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
    '{"username": "Administrator"}'::jsonb,  -- Můžeš změnit uživatelské jméno
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO admin_id;

  -- Část 2: Vytvoření záznamu v profiles tabulce s ID z předchozího kroku
  INSERT INTO public.profiles (
    id,
    username,
    role,
    created_at
  ) VALUES (
    admin_id,  -- Automaticky použije ID z předchozího kroku
    'Administrator',  -- Uživatelské jméno
    'admin',  -- Role (admin)
    now()
  );

  -- Výpis vytvořeného ID pro kontrolu
  RAISE NOTICE 'Admin uživatel úspěšně vytvořen s ID: %', admin_id;
END;
$$;
