import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";

type Match = Database["public"]["Tables"]["matches"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];

export interface MatchWithTeam extends Match {
  host_team: Team;
}

export interface MatchWithTeams extends Match {
  host_team: Team;
  challenger_team: Team | null;
}

export interface MatchFilters {
  region_depth1?: string;
  region_depth2?: string;
  target_tier?: string;
}

export async function getOpenMatches(
  filters?: MatchFilters
): Promise<MatchWithTeam[]> {
  const supabase = await createClient();

  let query = supabase
    .from("matches")
    .select(
      `
      *,
      host_team:teams!host_team_id(*)
    `
    )
    .eq("status", "OPEN")
    .order("scheduled_at", { ascending: true });

  if (filters?.target_tier) {
    query = query.eq("target_tier", filters.target_tier);
  }

  const { data } = await query;

  let matches = (data || []) as unknown as MatchWithTeam[];

  // Filter by region (needs to be done client-side due to join)
  if (filters?.region_depth1) {
    matches = matches.filter(
      (m) => m.host_team.region_depth1 === filters.region_depth1
    );
  }
  if (filters?.region_depth2) {
    matches = matches.filter(
      (m) => m.host_team.region_depth2 === filters.region_depth2
    );
  }

  return matches;
}

export async function getMyMatches(): Promise<MatchWithTeams[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Get user's team
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (!profile?.team_id) return [];

  const { data } = await supabase
    .from("matches")
    .select(
      `
      *,
      host_team:teams!host_team_id(*),
      challenger_team:teams!challenger_team_id(*)
    `
    )
    .or(`host_team_id.eq.${profile.team_id},challenger_team_id.eq.${profile.team_id}`)
    .order("scheduled_at", { ascending: false });

  return (data || []) as unknown as MatchWithTeams[];
}

export async function getMatchById(
  matchId: string
): Promise<MatchWithTeams | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("matches")
    .select(
      `
      *,
      host_team:teams!host_team_id(*),
      challenger_team:teams!challenger_team_id(*)
    `
    )
    .eq("id", matchId)
    .single();

  return data as unknown as MatchWithTeams | null;
}
