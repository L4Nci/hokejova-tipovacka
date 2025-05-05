-- Ensure we have the correct foreign key relationships for tips table
ALTER TABLE public.tips
  ADD CONSTRAINT fk_tips_profiles
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.tips
  ADD CONSTRAINT fk_tips_matches
  FOREIGN KEY (match_id) 
  REFERENCES public.matches(id)
  ON DELETE CASCADE;

-- Create points table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.points (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tip_id UUID NOT NULL REFERENCES public.tips(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tips_user_id ON public.tips(user_id);
CREATE INDEX IF NOT EXISTS idx_tips_match_id ON public.tips(match_id);
CREATE INDEX IF NOT EXISTS idx_points_tip_id ON public.points(tip_id);

-- Enable Row Level Security
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Enable read access for all users"
ON public.points FOR SELECT
TO authenticated
USING (true);

-- Update the tips query in your code to use proper joins
-- Example of how the query should look:
/*
SELECT 
  t.id,
  t.score_home,
  t.score_away,
  p.username,
  pt.points
FROM tips t
JOIN profiles p ON t.user_id = p.id
LEFT JOIN points pt ON pt.tip_id = t.id
WHERE t.match_id = :match_id;
*/
