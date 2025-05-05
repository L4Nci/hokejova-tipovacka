ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users"
ON auth.users FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

-- Povolení čtení profilů pro přihlášené uživatele
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
TO authenticated
USING (true);
