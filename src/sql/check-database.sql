-- Skript pro kontrolu databáze a uživatelů

-- 1. Kontrola existujících tabulek
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Kontrola všech uživatelů v auth.users
SELECT 
  id, 
  email, 
  email_confirmed_at, 
  last_sign_in_at,
  CASE 
    WHEN raw_app_meta_data->>'role' = 'admin' THEN 'Admin z meta_data'
    ELSE 'Není admin v meta_data'
  END as app_meta_role
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 3. Kontrola všech profilů v public.profiles
SELECT 
  id, 
  username, 
  role, 
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- 4. Kontrola vazby mezi auth.users a profiles
SELECT 
  u.id, 
  u.email, 
  p.username, 
  p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;

-- 5. Kontrola funkce pro výpočet bodů
SELECT pg_get_functiondef((SELECT oid FROM pg_proc WHERE proname = 'calculate_points'));

-- 6. Kontrola triggeru pro výpočet bodů
SELECT 
  event_manipulation, 
  action_timing, 
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'calculate_points_trigger';
