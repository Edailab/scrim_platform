-- Add invite_code column to teams table
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Generate invite codes for existing teams
UPDATE public.teams
SET invite_code = upper(substr(md5(random()::text || id::text), 1, 8))
WHERE invite_code IS NULL;

-- Make invite_code required
ALTER TABLE public.teams ALTER COLUMN invite_code SET NOT NULL;

-- Add index for faster invite code lookups
CREATE INDEX IF NOT EXISTS idx_teams_invite_code ON public.teams(invite_code);
