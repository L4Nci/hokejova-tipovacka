-- Ověření admin účtu
SELECT 
  u.id,
  u.email,
  u.role as auth_role,
  u.raw_app_meta_data,
  u.raw_user_meta_data,
  u.email_confirmed_at,
  u.created_at,
  p.role as profile_role,
  p.username
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@ms2025.cz';

-- Ověření přihlašovacích práv
SELECT EXISTS (
  SELECT 1 
  FROM auth.users u
  WHERE u.email = 'admin@ms2025.cz'
  AND u.encrypted_password = crypt('admin123', u.encrypted_password)
);

-- Ověření RLS politik
SELECT tablename, schemaname, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';
