-- 1. Kontrola existence admin účtu
SELECT email, role, raw_user_meta_data 
FROM auth.users 
WHERE email = 'admin@ms2025.cz';

-- 2. Kontrola existence odpovídajícího profilu
SELECT id, username, role
FROM public.profiles
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'admin@ms2025.cz'
);

-- 3. Kontrola RLS politik pro profiles
SELECT *
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles';
