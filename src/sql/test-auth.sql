-- Test auth endpoint
CREATE OR REPLACE FUNCTION public.test_auth()
RETURNS json
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  -- Test basic auth functionality
  RETURN json_build_object(
    'status', 'success',
    'user_count', (SELECT COUNT(*) FROM auth.users),
    'admin_exists', EXISTS(
      SELECT 1 FROM auth.users u
      JOIN public.profiles p ON u.id = p.id
      WHERE u.email = 'admin@ms2025.cz' AND p.role = 'admin'
    )
  );
END;
$$;

-- Grant access
GRANT EXECUTE ON FUNCTION public.test_auth() TO authenticated;
