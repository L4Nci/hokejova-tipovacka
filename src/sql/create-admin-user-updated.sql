-- Vytvoření admin uživatele s přístupem ke všem funkcím
DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Část 1: Vytvoření uživatelského účtu v auth.users a získání jeho ID
  INSERT INTO auth.users (
    instance_id,
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'admin@hokej.cz',  -- Email administrátora
    crypt('AdminMS2025', gen_salt('bf')),  -- Silné heslo
    now(),
    '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
    '{"username": "HokejAdmin"}'::jsonb,  -- Uživatelské jméno
    now(),
    now()
  ) RETURNING id INTO admin_id;

  -- Část 2: Vytvoření záznamu v profiles tabulce s ID z předchozího kroku
  INSERT INTO public.profiles (
    id,
    username,
    role,
    created_at
  ) VALUES (
    admin_id,
    'HokejAdmin',  -- Uživatelské jméno
    'admin',       -- Role (admin)
    now()
  );

  -- Výpis vytvořeného ID pro kontrolu
  RAISE NOTICE 'Admin uživatel úspěšně vytvořen s ID: %', admin_id;
  RAISE NOTICE 'Přihlašovací údaje: admin@hokej.cz / AdminMS2025';
END;
$$;
