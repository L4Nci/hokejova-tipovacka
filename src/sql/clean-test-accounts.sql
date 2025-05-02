-- Skript pro vymazání všech testovacích účtů z databáze

DO $$
BEGIN
    -- Nejprve vyčistíme záznamy v tabulce profiles
    -- (Musíme začít s profiles, protože má reference na auth.users)
    DELETE FROM public.profiles
    WHERE id IN (
        SELECT id FROM auth.users
        WHERE email IN (
            'petr@example.com',
            'jana@example.com',
            'admin@example.com',
            'test@test.com',
            'test2@test.com',
            'hrac1@example.com',
            'hrac2@example.com'
        )
    );

    -- Nyní můžeme vymazat samotné uživatele
    DELETE FROM auth.users
    WHERE email IN (
        'petr@example.com',
        'jana@example.com',
        'admin@example.com',
        'test@test.com',
        'test2@test.com',
        'hrac1@example.com',
        'hrac2@example.com'
    );

    RAISE NOTICE 'Všechny testovací účty byly úspěšně odstraněny.';
END;
$$;
