-- Kontrola uživatelských účtů
SELECT 
  au.id,
  au.email,
  au.confirmed_at,
  au.email_confirmed_at,
  au.role,
  p.username,
  p.role as profile_role
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE au.email = 'admin@ms2025.cz';

-- Kontrola nastavení autentizace
SELECT * FROM auth.identities 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@ms2025.cz'
);
