"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateInviteCode } from "@/lib/utils/invite";

export type TeamResult = {
  error?: string;
};

export async function createTeam(formData: FormData): Promise<TeamResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // Check if user already has a team
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (profile?.team_id) {
    return { error: "이미 팀에 소속되어 있습니다." };
  }

  const name = formData.get("name") as string;
  const regionDepth1 = formData.get("region_depth1") as string;
  const regionDepth2 = formData.get("region_depth2") as string;
  const regionDepth3 = formData.get("region_depth3") as string;
  const contactLink = formData.get("contact_link") as string;

  if (!name || !regionDepth1 || !regionDepth2 || !regionDepth3 || !contactLink) {
    return { error: "모든 필드를 입력해주세요." };
  }

  // Create team with invite code
  const inviteCode = generateInviteCode();
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({
      name,
      region_depth1: regionDepth1,
      region_depth2: regionDepth2,
      region_depth3: regionDepth3,
      captain_id: user.id,
      contact_link: contactLink,
      invite_code: inviteCode,
    })
    .select()
    .single();

  if (teamError) {
    return { error: teamError.message };
  }

  // Update user's profile with team_id
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ team_id: team.id })
    .eq("id", user.id);

  if (profileError) {
    // Rollback team creation
    await supabase.from("teams").delete().eq("id", team.id);
    return { error: profileError.message };
  }

  revalidatePath("/team");
  redirect("/team");
}

export async function updateTeam(formData: FormData): Promise<TeamResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const teamId = formData.get("team_id") as string;

  // Verify user is captain
  const { data: team } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", teamId)
    .single();

  if (!team || team.captain_id !== user.id) {
    return { error: "팀장만 수정할 수 있습니다." };
  }

  const contactLink = formData.get("contact_link") as string;

  if (!contactLink) {
    return { error: "연락 링크를 입력해주세요." };
  }

  const { error } = await supabase
    .from("teams")
    .update({ contact_link: contactLink })
    .eq("id", teamId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/team");
  return {};
}

export async function leaveTeam(): Promise<TeamResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // Get user's team
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (!profile?.team_id) {
    return { error: "팀에 소속되어 있지 않습니다." };
  }

  // Check if user is captain
  const { data: team } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", profile.team_id)
    .single();

  if (team?.captain_id === user.id) {
    return { error: "팀장은 팀을 탈퇴할 수 없습니다. 팀을 해체하거나 팀장을 위임하세요." };
  }

  // Leave team
  const { error } = await supabase
    .from("profiles")
    .update({ team_id: null, position: null })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/team");
  redirect("/team");
}

export async function joinTeamByCode(code: string): Promise<TeamResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // Check if user is Riot verified and doesn't already have a team
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id, riot_verified_at")
    .eq("id", user.id)
    .single();

  if (!profile?.riot_verified_at) {
    return { error: "라이엇 계정 인증이 필요합니다." };
  }

  if (profile?.team_id) {
    return { error: "이미 팀에 소속되어 있습니다." };
  }

  // Find team by invite code
  const { data: team } = await supabase
    .from("teams")
    .select("id, name")
    .eq("invite_code", code.toUpperCase())
    .single();

  if (!team) {
    return { error: "유효하지 않은 초대 코드입니다." };
  }

  // Join team (position not set - can be set later)
  const { error } = await supabase
    .from("profiles")
    .update({ team_id: team.id })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/team");
  redirect("/team");
}
