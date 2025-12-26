"use server";

import { createClient } from "@/lib/supabase/server";
import { verifyRiotAccount } from "@/lib/riot/api";
import { revalidatePath } from "next/cache";

export type RiotResult = {
  error?: string;
  success?: boolean;
};

export async function connectRiotAccount(riotId: string): Promise<RiotResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // Check if user already has a Riot account connected
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("riot_verified_at")
    .eq("id", user.id)
    .single();

  if (existingProfile?.riot_verified_at) {
    return { error: "이미 라이엇 계정이 연결되어 있습니다." };
  }

  // Verify with Riot API
  const result = await verifyRiotAccount(riotId);

  if (!result.success || !result.data) {
    return { error: result.error || "인증에 실패했습니다." };
  }

  // Check if this PUUID is already registered by another user
  const { data: existingPuuid } = await supabase
    .from("profiles")
    .select("id")
    .eq("riot_puuid", result.data.puuid)
    .single();

  if (existingPuuid && existingPuuid.id !== user.id) {
    return { error: "이미 다른 계정에서 사용 중인 라이엇 계정입니다." };
  }

  // Update profile with Riot data
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      riot_puuid: result.data.puuid,
      riot_game_name: result.data.gameName,
      riot_tag_line: result.data.tagLine,
      riot_region: "kr",
      summoner_name: `${result.data.gameName}#${result.data.tagLine}`,
      summoner_level: result.data.summonerLevel,
      tier: result.data.tier,
      tier_rank: result.data.rank,
      tier_lp: result.data.leaguePoints,
      riot_verified_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/profile");
  revalidatePath("/team");

  return { success: true };
}

export async function refreshRiotData(): Promise<RiotResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("riot_game_name, riot_tag_line")
    .eq("id", user.id)
    .single();

  if (!profile?.riot_game_name || !profile?.riot_tag_line) {
    return { error: "연결된 라이엇 계정이 없습니다." };
  }

  const riotId = `${profile.riot_game_name}#${profile.riot_tag_line}`;
  const result = await verifyRiotAccount(riotId);

  if (!result.success || !result.data) {
    return { error: result.error || "데이터 갱신에 실패했습니다." };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      summoner_level: result.data.summonerLevel,
      tier: result.data.tier,
      tier_rank: result.data.rank,
      tier_lp: result.data.leaguePoints,
    })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/profile");
  revalidatePath("/team");

  return { success: true };
}
