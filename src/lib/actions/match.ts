"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type MatchResult = {
  error?: string;
  contactLink?: string;
};

export async function createMatch(formData: FormData): Promise<MatchResult> {
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
    return { error: "팀에 소속되어 있어야 합니다." };
  }

  // Check if user is captain
  const { data: team } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", profile.team_id)
    .single();

  if (team?.captain_id !== user.id) {
    return { error: "팀장만 격문을 올릴 수 있습니다." };
  }

  // Check if team has at least 5 members and all are Riot verified
  const { data: members } = await supabase
    .from("profiles")
    .select("id, riot_verified_at")
    .eq("team_id", profile.team_id);

  if (!members || members.length < 5) {
    return { error: "팀원이 5명 이상이어야 격문을 올릴 수 있습니다." };
  }

  const unverifiedMembers = members.filter((m) => !m.riot_verified_at);
  if (unverifiedMembers.length > 0) {
    return { error: "모든 팀원이 라이엇 계정 인증을 완료해야 합니다." };
  }

  const scheduledAt = formData.get("scheduled_at") as string;
  const targetTier = formData.get("target_tier") as string;

  if (!scheduledAt) {
    return { error: "경기 예정 시간을 선택해주세요." };
  }

  const { error } = await supabase.from("matches").insert({
    host_team_id: profile.team_id,
    scheduled_at: scheduledAt,
    target_tier: targetTier && targetTier !== "ALL" ? targetTier : null,
    status: "OPEN",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/arena");
  redirect("/arena");
}

export async function acceptMatch(matchId: string): Promise<MatchResult> {
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
    return { error: "팀에 소속되어 있어야 합니다." };
  }

  // Check if user is captain
  const { data: myTeam } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", profile.team_id)
    .single();

  if (myTeam?.captain_id !== user.id) {
    return { error: "팀장만 경기를 수락할 수 있습니다." };
  }

  // Get match
  const { data: match } = await supabase
    .from("matches")
    .select("*, host_team:teams!host_team_id(contact_link)")
    .eq("id", matchId)
    .single();

  if (!match) {
    return { error: "경기를 찾을 수 없습니다." };
  }

  if (match.status !== "OPEN") {
    return { error: "이미 매칭된 경기입니다." };
  }

  if (match.host_team_id === profile.team_id) {
    return { error: "자신의 팀에 도전할 수 없습니다." };
  }

  // Accept match
  const { error } = await supabase
    .from("matches")
    .update({
      challenger_team_id: profile.team_id,
      status: "MATCHED",
    })
    .eq("id", matchId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/arena");
  revalidatePath("/matches");

  // Return host team's contact link
  const hostTeam = match.host_team as { contact_link: string };
  return { contactLink: hostTeam.contact_link };
}

export async function cancelMatch(matchId: string): Promise<MatchResult> {
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
    return { error: "팀에 소속되어 있어야 합니다." };
  }

  // Get match
  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (!match) {
    return { error: "경기를 찾을 수 없습니다." };
  }

  if (match.host_team_id !== profile.team_id) {
    return { error: "자신이 올린 격문만 취소할 수 있습니다." };
  }

  if (match.status !== "OPEN") {
    return { error: "이미 매칭된 경기는 취소할 수 없습니다." };
  }

  // Delete match
  const { error } = await supabase.from("matches").delete().eq("id", matchId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/arena");
  return {};
}
