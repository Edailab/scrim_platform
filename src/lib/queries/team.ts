import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";

type Team = Database["public"]["Tables"]["teams"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface TeamWithMembers extends Team {
  members: Profile[];
}

export async function getMyTeam(): Promise<Team | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (!profile?.team_id) return null;

  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", profile.team_id)
    .single();

  return team;
}

export async function getTeamWithMembers(
  teamId: string
): Promise<TeamWithMembers | null> {
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single();

  if (!team) return null;

  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .eq("team_id", teamId);

  return {
    ...team,
    members: members || [],
  };
}

export async function getTeamById(teamId: string): Promise<Team | null> {
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single();

  return team;
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}
