-- Fix schema for DongTier
-- This migration handles existing partial tables

-- Drop existing tables to recreate them properly
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Profiles table (must be created first due to foreign key dependencies)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID,
  position TEXT CHECK (position IN ('TOP', 'JUNGLE', 'MID', 'ADC', 'SUP')),
  tier_data JSONB,
  summoner_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region_depth1 TEXT NOT NULL,
  region_depth2 TEXT NOT NULL,
  region_depth3 TEXT NOT NULL,
  captain_id UUID NOT NULL REFERENCES public.profiles(id),
  contact_link TEXT NOT NULL,
  avg_tier_score NUMERIC,
  win_count INTEGER DEFAULT 0,
  loss_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key from profiles to teams
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_team_id_fkey
FOREIGN KEY (team_id) REFERENCES public.teams(id);

-- Matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  challenger_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'MATCHED', 'PENDING_RESULT', 'COMPLETED', 'DISPUTED')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  target_tier TEXT,
  result_screenshot_url TEXT,
  winner_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper functions for win/loss counting
CREATE OR REPLACE FUNCTION public.increment_win_count(team_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.teams SET win_count = win_count + 1, updated_at = NOW() WHERE id = team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_loss_count(team_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.teams SET loss_count = loss_count + 1, updated_at = NOW() WHERE id = team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
CREATE POLICY "Teams are viewable by everyone" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Team captain can insert" ON public.teams FOR INSERT WITH CHECK (auth.uid() = captain_id);
CREATE POLICY "Team captain can update" ON public.teams FOR UPDATE USING (auth.uid() = captain_id);
CREATE POLICY "Team captain can delete" ON public.teams FOR DELETE USING (auth.uid() = captain_id);

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for matches
CREATE POLICY "Matches are viewable by everyone" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Team captain can insert matches" ON public.matches FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.teams WHERE id = host_team_id AND captain_id = auth.uid()));
CREATE POLICY "Participants can update matches" ON public.matches FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.teams WHERE id = host_team_id AND captain_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.teams WHERE id = challenger_team_id AND captain_id = auth.uid())
  );
CREATE POLICY "Host captain can delete open matches" ON public.matches FOR DELETE
  USING (
    status = 'OPEN' AND
    EXISTS (SELECT 1 FROM public.teams WHERE id = host_team_id AND captain_id = auth.uid())
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_scheduled ON public.matches(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_profiles_team ON public.profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_region ON public.teams(region_depth1, region_depth2);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create profiles for existing users who don't have one
INSERT INTO public.profiles (id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
