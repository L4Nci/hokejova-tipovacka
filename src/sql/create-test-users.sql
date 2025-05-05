DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Try to get existing test user 1
  SELECT id INTO user_id FROM auth.users WHERE email = 'test1@example.com';
  
  -- Create test user 1 if not exists
  IF user_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      email,
      email_confirmed_at,
      encrypted_password,
      aud,
      role,
      raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'test1@example.com',
      now(),
      crypt('test123', gen_salt('bf')),
      'authenticated',
      'authenticated', 
      jsonb_build_object('username', 'TestUser1')
    ) RETURNING id INTO user_id;

    -- Create profile for test user 1
    INSERT INTO profiles (id, username, role)
    VALUES (user_id, 'TestUser1', 'user')
    ON CONFLICT (username) DO NOTHING;
  END IF;

  -- Try to get existing test user 2  
  SELECT id INTO user_id FROM auth.users WHERE email = 'test2@example.com';

  -- Create test user 2 if not exists
  IF user_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      email,
      email_confirmed_at,
      encrypted_password,
      aud,
      role,
      raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'test2@example.com',
      now(),
      crypt('test123', gen_salt('bf')),
      'authenticated',
      'authenticated',
      jsonb_build_object('username', 'TestUser2')
    ) RETURNING id INTO user_id;

    -- Create profile for test user 2
    INSERT INTO profiles (id, username, role)
    VALUES (user_id, 'TestUser2', 'user')
    ON CONFLICT (username) DO NOTHING;
  END IF;

END $$;
