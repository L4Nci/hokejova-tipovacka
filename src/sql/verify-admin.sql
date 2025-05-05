-- Kontrola existence a integrity admin účtu
DO $$
DECLARE
  admin_user_id UUID;
  admin_profile_id UUID;
BEGIN
  -- Kontrola v auth.users
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@ms2025.cz';
  
  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'Admin uživatel neexistuje v auth.users!';
  ELSE
    RAISE NOTICE 'Admin uživatel nalezen v auth.users s ID: %', admin_user_id;
  END IF;

  -- Kontrola v public.profiles
  SELECT id INTO admin_profile_id 
  FROM public.profiles 
  WHERE username = 'Administrator';
  
  IF admin_profile_id IS NULL THEN
    RAISE NOTICE 'Admin profil neexistuje v public.profiles!';
  ELSE
    RAISE NOTICE 'Admin profil nalezen v public.profiles s ID: %', admin_profile_id;
  END IF;

  -- Kontrola shody ID
  IF admin_user_id IS NOT NULL AND admin_profile_id IS NOT NULL THEN
    IF admin_user_id = admin_profile_id THEN
      RAISE NOTICE 'ID se shodují - vazba je správná';
    ELSE
      RAISE NOTICE 'ID se neshodují! User ID: %, Profile ID: %', admin_user_id, admin_profile_id;
    END IF;
  END IF;
END $$;

-- Výpis detailů účtu
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at IS NOT NULL as is_email_confirmed,
  au.encrypted_password IS NOT NULL as has_password,
  p.username,
  p.role
FROM auth.users au
JOIN public.profiles p ON au.id = p.id
WHERE au.email = 'admin@ms2025.cz';
