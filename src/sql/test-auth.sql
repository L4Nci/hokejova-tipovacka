-- Test přístupu k auth schématu
SELECT EXISTS (
  SELECT 1 
  FROM auth.users 
  WHERE email = 'admin@ms2025.cz'
);

-- Test přístupu k profiles
SELECT EXISTS (
  SELECT 1 
  FROM public.profiles 
  WHERE role = 'admin'
);

-- Test RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
