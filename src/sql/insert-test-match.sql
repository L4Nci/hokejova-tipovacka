-- Vložení testovacího zápasu ČR vs SR
DO $$
DECLARE
    match_id UUID;
    test_user_id UUID;
BEGIN
    -- Get or create test user
    INSERT INTO profiles (username, role)
    VALUES ('Tester', 'user')
    RETURNING id INTO test_user_id;

    -- Insert match
    INSERT INTO matches (
        id,
        team_home, 
        team_away,
        flag_home_url,
        flag_away_url, 
        match_time,
        group_name
    ) VALUES (
        gen_random_uuid(),
        'Česko',
        'Slovensko',
        '/flags/cze.png',
        '/flags/svk.png',
        NOW() - interval '1 day',
        'A'
    ) RETURNING id INTO match_id;

    -- Insert test tip
    INSERT INTO tips (user_id, match_id, score_home, score_away)
    VALUES (test_user_id, match_id, 1, 2);

    -- Insert match result
    INSERT INTO results (match_id, final_score_home, final_score_away)
    VALUES (match_id, 1, 2);

    -- Verify points calculation
    RAISE NOTICE 'Points calculated for match %, check points table', match_id;
END;
$$;

-- Verify insertion and points
SELECT 
    m.team_home,
    m.team_away,
    t.score_home as tip_score_home,
    t.score_away as tip_score_away,
    r.final_score_home,
    r.final_score_away,
    p.points,
    pr.username
FROM matches m
JOIN results r ON m.id = r.match_id
JOIN tips t ON m.id = t.match_id
JOIN points p ON p.match_id = m.id AND p.user_id = t.user_id
JOIN profiles pr ON pr.id = t.user_id
WHERE m.team_home = 'Česko' AND m.team_away = 'Slovensko'
ORDER BY m.match_time DESC
LIMIT 1;
