"use server";

import { createClient } from "@/lib/supabase/server";
import {
  verifyRiotAccount,
  getAccountByRiotId,
  getSummonerByPuuid,
  getLeagueEntries,
} from "@/lib/riot/api";
import { revalidatePath } from "next/cache";

export type RiotResult = {
  error?: string;
  success?: boolean;
};

export type InitiateResult = {
  error?: string;
  success?: boolean;
  requiredIconId?: number;
  gameName?: string;
  tagLine?: string;
};

// Common default profile icons that all players have access to
const VERIFICATION_ICONS = [
  29, // Poro icon
  28, // Blue minion
  27, // Red minion
  26, // Melee minion
  25, // Caster minion
  23, // Siege minion
  22, // Super minion
  21, // Baron
  20, // Dragon
  19, // Blue buff
];

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

// Step 1: Initiate verification - validate account and assign required icon
export async function initiateVerification(
  riotId: string
): Promise<InitiateResult> {
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

  // Parse Riot ID
  const parts = riotId.split("#");
  if (parts.length !== 2) {
    return {
      error: "라이엇 ID 형식이 올바르지 않습니다. (예: 소환사명#KR1)",
    };
  }

  const [gameName, tagLine] = parts;

  try {
    // Step 1: Verify account exists
    const account = await getAccountByRiotId(gameName, tagLine);

    // Step 2: Get summoner data for level check
    const summoner = await getSummonerByPuuid(account.puuid);

    if (summoner.summonerLevel < 30) {
      return {
        error: `소환사 레벨이 30 이상이어야 합니다. (현재: ${summoner.summonerLevel})`,
      };
    }

    // Step 3: Check if PUUID is already used by another user
    const { data: existingPuuid } = await supabase
      .from("profiles")
      .select("id")
      .eq("riot_puuid", account.puuid)
      .single();

    if (existingPuuid && existingPuuid.id !== user.id) {
      return { error: "이미 다른 계정에서 사용 중인 라이엇 계정입니다." };
    }

    // Generate random required icon
    const requiredIconId =
      VERIFICATION_ICONS[Math.floor(Math.random() * VERIFICATION_ICONS.length)];

    // Store pending verification data
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        pending_riot_id: riotId,
        required_icon_id: requiredIconId,
      })
      .eq("id", user.id);

    if (updateError) {
      return { error: updateError.message };
    }

    return {
      success: true,
      requiredIconId,
      gameName: account.gameName,
      tagLine: account.tagLine,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("404")) {
        return { error: "라이엇 계정을 찾을 수 없습니다." };
      }
      if (error.message.includes("429")) {
        return { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." };
      }
    }
    return { error: "라이엇 API 오류가 발생했습니다." };
  }
}

// Step 2: Confirm verification - check if icon matches
export async function confirmVerification(): Promise<RiotResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // Get pending verification data
  const { data: profile } = await supabase
    .from("profiles")
    .select("pending_riot_id, required_icon_id")
    .eq("id", user.id)
    .single();

  if (!profile?.pending_riot_id || !profile?.required_icon_id) {
    return { error: "진행 중인 인증이 없습니다. 처음부터 다시 시도해주세요." };
  }

  const parts = profile.pending_riot_id.split("#");
  if (parts.length !== 2) {
    return { error: "저장된 라이엇 ID가 올바르지 않습니다." };
  }

  const [gameName, tagLine] = parts;

  try {
    // Get current account and summoner data
    const account = await getAccountByRiotId(gameName, tagLine);
    const summoner = await getSummonerByPuuid(account.puuid);

    // Check if icon matches
    if (summoner.profileIconId !== profile.required_icon_id) {
      return {
        error: `프로필 아이콘이 일치하지 않습니다. 아이콘을 변경한 후 다시 시도해주세요. (현재: ${summoner.profileIconId}, 필요: ${profile.required_icon_id})`,
      };
    }

    // Get ranked data (optional)
    const leagueEntries = await getLeagueEntries(account.puuid);
    const soloQueue = leagueEntries.find(
      (entry) => entry.queueType === "RANKED_SOLO_5x5"
    );

    // Verification successful - update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        riot_puuid: account.puuid,
        riot_game_name: account.gameName,
        riot_tag_line: account.tagLine,
        riot_region: "kr",
        summoner_name: `${account.gameName}#${account.tagLine}`,
        summoner_level: summoner.summonerLevel,
        tier: soloQueue?.tier ?? null,
        tier_rank: soloQueue?.rank ?? null,
        tier_lp: soloQueue?.leaguePoints ?? null,
        riot_verified_at: new Date().toISOString(),
        pending_riot_id: null,
        required_icon_id: null,
      })
      .eq("id", user.id);

    if (updateError) {
      return { error: updateError.message };
    }

    revalidatePath("/profile");
    revalidatePath("/team");

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("404")) {
        return { error: "라이엇 계정을 찾을 수 없습니다." };
      }
      if (error.message.includes("429")) {
        return { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." };
      }
    }
    return { error: "라이엇 API 오류가 발생했습니다." };
  }
}

// Cancel pending verification
export async function cancelVerification(): Promise<RiotResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      pending_riot_id: null,
      required_icon_id: null,
    })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  return { success: true };
}
