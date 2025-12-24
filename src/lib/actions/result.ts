"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ResultActionResult = {
  error?: string;
};

export async function reportResult(
  matchId: string,
  formData: FormData
): Promise<ResultActionResult> {
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

  // Verify user is part of the match
  const isHost = match.host_team_id === profile.team_id;
  const isChallenger = match.challenger_team_id === profile.team_id;

  if (!isHost && !isChallenger) {
    return { error: "이 경기에 참여하지 않았습니다." };
  }

  if (match.status !== "MATCHED") {
    return { error: "결과를 보고할 수 없는 상태입니다." };
  }

  const result = formData.get("result") as "win" | "loss";
  const winnerTeamId =
    result === "win" ? profile.team_id : isHost ? match.challenger_team_id : match.host_team_id;

  // Update match with result claim
  const { error } = await supabase
    .from("matches")
    .update({
      winner_team_id: winnerTeamId,
      status: "PENDING_RESULT",
    })
    .eq("id", matchId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/matches");
  return {};
}

export async function confirmResult(
  matchId: string
): Promise<ResultActionResult> {
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

  if (match.status !== "PENDING_RESULT") {
    return { error: "결과를 확인할 수 없는 상태입니다." };
  }

  // Verify user is part of the match but not the reporter
  const isHost = match.host_team_id === profile.team_id;
  const isChallenger = match.challenger_team_id === profile.team_id;

  if (!isHost && !isChallenger) {
    return { error: "이 경기에 참여하지 않았습니다." };
  }

  const winnerId = match.winner_team_id;
  const loserId =
    winnerId === match.host_team_id
      ? match.challenger_team_id
      : match.host_team_id;

  // Update match to completed
  const { error: matchError } = await supabase
    .from("matches")
    .update({ status: "COMPLETED" })
    .eq("id", matchId);

  if (matchError) {
    return { error: matchError.message };
  }

  // Update winner's win count
  if (winnerId) {
    await supabase.rpc("increment_win_count", { team_id: winnerId });
  }

  // Update loser's loss count
  if (loserId) {
    await supabase.rpc("increment_loss_count", { team_id: loserId });
  }

  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/matches");
  revalidatePath("/team");
  return {};
}

export async function disputeResult(
  matchId: string
): Promise<ResultActionResult> {
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

  if (match.status !== "PENDING_RESULT") {
    return { error: "이의를 제기할 수 없는 상태입니다." };
  }

  // Verify user is part of the match
  const isHost = match.host_team_id === profile.team_id;
  const isChallenger = match.challenger_team_id === profile.team_id;

  if (!isHost && !isChallenger) {
    return { error: "이 경기에 참여하지 않았습니다." };
  }

  // Update match to disputed
  const { error } = await supabase
    .from("matches")
    .update({ status: "DISPUTED" })
    .eq("id", matchId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/matches");
  return {};
}
