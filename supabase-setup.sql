-- DongTier Database Setup
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ohnamayjrqoprtymnouk/sql/new

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table (linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  team_id uuid,
  position text check (position in ('TOP', 'JUNGLE', 'MID', 'ADC', 'SUP')),
  tier_data jsonb,
  summoner_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create teams table
create table public.teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  region_depth1 text not null,
  region_depth2 text not null,
  region_depth3 text not null,
  captain_id uuid references public.profiles(id) not null,
  contact_link text not null,
  avg_tier_score numeric,
  win_count integer default 0 not null,
  loss_count integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add foreign key from profiles to teams
alter table public.profiles
  add constraint profiles_team_id_fkey
  foreign key (team_id) references public.teams(id);

-- Create matches table
create table public.matches (
  id uuid default uuid_generate_v4() primary key,
  host_team_id uuid references public.teams(id) not null,
  challenger_team_id uuid references public.teams(id),
  status text default 'OPEN' check (status in ('OPEN', 'MATCHED', 'PENDING_RESULT', 'COMPLETED', 'DISPUTED')) not null,
  scheduled_at timestamp with time zone not null,
  target_tier text,
  result_screenshot_url text,
  winner_team_id uuid references public.teams(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RPC functions for win/loss counting
create or replace function increment_win_count(team_id uuid)
returns void as $$
begin
  update public.teams set win_count = win_count + 1 where id = team_id;
end;
$$ language plpgsql security definer;

create or replace function increment_loss_count(team_id uuid)
returns void as $$
begin
  update public.teams set loss_count = loss_count + 1 where id = team_id;
end;
$$ language plpgsql security definer;

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.matches enable row level security;

-- RLS Policies for profiles
create policy "Users can view all profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- RLS Policies for teams
create policy "Anyone can view teams" on public.teams for select using (true);
create policy "Authenticated users can create teams" on public.teams for insert with check (auth.role() = 'authenticated');
create policy "Captain can update team" on public.teams for update using (auth.uid() = captain_id);

-- RLS Policies for matches
create policy "Anyone can view matches" on public.matches for select using (true);
create policy "Authenticated users can create matches" on public.matches for insert with check (auth.role() = 'authenticated');
create policy "Host or challenger captain can update match" on public.matches for update using (
  auth.uid() in (select captain_id from public.teams where id = host_team_id or id = challenger_team_id)
);
