-- 1. Přidání foreign key do tabulky tips
ALTER TABLE public.tips
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Nastavení vztahu mezi tips a profiles
ALTER TABLE public.tips
ADD CONSTRAINT tips_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- 3. Upravit dotaz v Dashboard.jsx pro správné spojení
