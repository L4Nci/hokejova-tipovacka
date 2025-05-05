-- Skript pro kontrolu struktury tabulky points a základní diagnostiku

-- 1. Vypíše strukturu tabulky
DO $$
DECLARE
    col RECORD;
BEGIN
    RAISE NOTICE 'Kontrola struktury databáze points...';
    
    FOR col IN
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'points'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Sloupec: % (typ: %, null?: %)', 
                    col.column_name, 
                    col.data_type, 
                    col.is_nullable;
    END LOOP;
END;
$$;

-- 2. Kontrola existence potřebných indexů
SELECT
  indexname,
  indexdef
FROM
  pg_indexes
WHERE
  tablename = 'points'
  AND schemaname = 'public';

-- 3. Kontrola existujících záznamů
SELECT COUNT(*) AS "počet záznamů v tabulce points" FROM public.points;

-- 4. Kontrola existujících vazeb
SELECT 
  'Vazba na uživatele existuje' AS kontrola,
  COUNT(*) AS "nalezeno záznamů"
FROM 
  public.points p
  JOIN public.profiles u ON p.user_id = u.id
UNION ALL
SELECT 
  'Vazba na zápasy existuje' AS kontrola,
  COUNT(*) AS "nalezeno záznamů"
FROM 
  public.points p
  JOIN public.matches m ON p.match_id = m.id;

-- 5. Test pro přidání záznamu
DO $$
DECLARE
  test_user_id UUID;
  test_match_id UUID;
BEGIN
  -- Získáme testovacího uživatele a zápas
  SELECT id INTO test_user_id FROM public.profiles LIMIT 1;
  SELECT id INTO test_match_id FROM public.matches LIMIT 1;
  
  IF test_user_id IS NOT NULL AND test_match_id IS NOT NULL THEN
    -- Zkusíme přidat záznam
    BEGIN
      INSERT INTO public.points (user_id, match_id, points)
      VALUES (test_user_id, test_match_id, 5)
      ON CONFLICT (user_id, match_id) DO NOTHING;
      RAISE NOTICE 'Test přidání záznamu proběhl úspěšně';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Chyba při přidání záznamu: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'Nemohu provést test, nenalezen testovací uživatel nebo zápas';
  END IF;
END $$;
