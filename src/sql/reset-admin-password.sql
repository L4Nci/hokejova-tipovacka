-- Reset hesla pro admin účet
UPDATE auth.users 
SET 
  encrypted_password = crypt('admin123', gen_salt('bf')),
  updated_at = now(),
  email_confirmed_at = now()
WHERE email = 'admin@ms2025.cz';

-- Ověření
SELECT 
  email,
  email_confirmed_at,
  confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'admin@ms2025.cz';
