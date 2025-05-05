-- Vypnutí foreign key kontrol pro tento příkaz
SET session_replication_role = 'replica';

-- Vyčištění dat v tomto pořadí
TRUNCATE TABLE points CASCADE;
TRUNCATE TABLE tips CASCADE;
TRUNCATE TABLE results CASCADE;

-- Nejdřív smažeme profily (kromě admina)
DELETE FROM profiles WHERE role != 'admin';

-- Pak teprve můžeme smazat uživatele
DELETE FROM auth.users WHERE id NOT IN (
    SELECT id FROM profiles WHERE role = 'admin'
);

-- Zapnutí foreign key kontrol zpět
SET session_replication_role = 'origin';

-- Kontrolní výpis počtu zbývajících uživatelů
SELECT COUNT(*) as remaining_users FROM auth.users;
SELECT COUNT(*) as remaining_profiles FROM profiles;
