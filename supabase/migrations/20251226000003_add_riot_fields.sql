-- Add Riot account fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS riot_puuid TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS riot_game_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS riot_tag_line TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS riot_region TEXT DEFAULT 'kr';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS summoner_level INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier_rank TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier_lp INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS riot_verified_at TIMESTAMPTZ;

-- Add index for faster PUUID lookups
CREATE INDEX IF NOT EXISTS idx_profiles_riot_puuid ON public.profiles(riot_puuid);

-- Add RLS policy for users to update their own Riot data
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
