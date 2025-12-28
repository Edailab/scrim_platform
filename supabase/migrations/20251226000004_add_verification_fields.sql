-- Add pending verification fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS pending_riot_id TEXT,
ADD COLUMN IF NOT EXISTS required_icon_id INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN profiles.pending_riot_id IS 'Riot ID pending verification (gameName#tagLine)';
COMMENT ON COLUMN profiles.required_icon_id IS 'Required profile icon ID for verification';
