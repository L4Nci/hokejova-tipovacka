-- Kontrola existence uživatele a jeho nastavení
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at IS NOT NULL as is_email_confirmed,
  au.encrypted_password IS NOT NULL as has_password,
  au.raw_app_meta_data,
  p.role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.email = 'admin@ms2025.cz';
