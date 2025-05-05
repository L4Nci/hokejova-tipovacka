DO $$
BEGIN
    -- First ensure the test profile exists
    INSERT INTO public.profiles (id, username, role)
    VALUES (
        'd431168f-df4a-4597-8e9d-ab6b45c58517',
        'Tester',
        'user'
    )
    ON CONFLICT (id) DO UPDATE SET username = 'Tester';

    -- Then proceed with the foreign key setup
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'tips' 
                  AND column_name = 'user_id') THEN
        ALTER TABLE public.tips 
        ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
              WHERE constraint_name = 'tips_user_id_fkey' 
              AND table_name = 'tips') THEN
        ALTER TABLE public.tips DROP CONSTRAINT tips_user_id_fkey;
    END IF;

    ALTER TABLE public.tips
    ADD CONSTRAINT tips_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;

    -- Add tip_id to points table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'points' 
                  AND column_name = 'tip_id') THEN
        ALTER TABLE public.points 
        ADD COLUMN tip_id UUID REFERENCES public.tips(id) ON DELETE CASCADE;
    END IF;

    -- Update existing points
    UPDATE public.points p
    SET tip_id = t.id
    FROM public.tips t
    WHERE p.user_id = t.user_id AND p.match_id = t.match_id;
    
    RAISE NOTICE 'Relations updated successfully';
END $$;
