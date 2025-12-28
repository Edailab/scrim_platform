import {
  RiotAccount,
  Summoner,
  LeagueEntry,
  RiotVerificationResult,
} from "./types";

const PLATFORM = "kr"; // Korea platform
const REGIONAL = "asia"; // Asia regional routing

class RiotApiError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "RiotApiError";
  }
}

async function fetchRiotApi<T>(url: string): Promise<T> {
  const apiKey = process.env.RIOT_API_KEY;

  if (!apiKey) {
    throw new RiotApiError("Riot API key not configured", 500);
  }

  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": apiKey,
    },
    next: { revalidate: 0 }, // Don't cache
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new RiotApiError("Account not found", 404);
    }
    if (response.status === 429) {
      throw new RiotApiError("Rate limit exceeded", 429);
    }
    throw new RiotApiError(`Riot API error: ${response.status}`, response.status);
  }

  return response.json();
}

// Fetch account by Riot ID (gameName#tagLine)
export async function getAccountByRiotId(
  gameName: string,
  tagLine: string
): Promise<RiotAccount> {
  const url = `https://${REGIONAL}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return fetchRiotApi<RiotAccount>(url);
}

// Fetch summoner by PUUID
export async function getSummonerByPuuid(puuid: string): Promise<Summoner> {
  const url = `https://${PLATFORM}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  return fetchRiotApi<Summoner>(url);
}

// Fetch ranked data by PUUID
export async function getLeagueEntries(
  puuid: string
): Promise<LeagueEntry[]> {
  const url = `https://${PLATFORM}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
  return fetchRiotApi<LeagueEntry[]>(url);
}

// Full verification flow
export async function verifyRiotAccount(
  riotId: string
): Promise<RiotVerificationResult> {
  // Parse Riot ID (format: GameName#TAG)
  const parts = riotId.split("#");
  if (parts.length !== 2) {
    return {
      success: false,
      error: "라이엇 ID 형식이 올바르지 않습니다. (예: 소환사명#KR1)",
    };
  }

  const [gameName, tagLine] = parts;

  try {
    // Step 1: Get account by Riot ID
    const account = await getAccountByRiotId(gameName, tagLine);

    // Step 2: Get summoner data
    const summoner = await getSummonerByPuuid(account.puuid);

    // Step 3: Check level requirement
    if (summoner.summonerLevel < 30) {
      return {
        success: false,
        error: `소환사 레벨이 30 이상이어야 합니다. (현재: ${summoner.summonerLevel})`,
      };
    }

    // Step 4: Get ranked data
    const leagueEntries = await getLeagueEntries(account.puuid);

    // Find solo queue entry
    const soloQueue = leagueEntries.find(
      (entry) => entry.queueType === "RANKED_SOLO_5x5"
    );

    if (!soloQueue) {
      return {
        success: false,
        error: "솔로 랭크 배치가 완료되어야 합니다.",
      };
    }

    return {
      success: true,
      data: {
        puuid: account.puuid,
        gameName: account.gameName,
        tagLine: account.tagLine,
        summonerLevel: summoner.summonerLevel,
        tier: soloQueue.tier,
        rank: soloQueue.rank,
        leaguePoints: soloQueue.leaguePoints,
      },
    };
  } catch (error) {
    if (error instanceof RiotApiError) {
      if (error.statusCode === 404) {
        return {
          success: false,
          error: "라이엇 계정을 찾을 수 없습니다.",
        };
      }
      if (error.statusCode === 429) {
        return {
          success: false,
          error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
        };
      }
      if (error.statusCode === 401 || error.statusCode === 403) {
        return {
          success: false,
          error: "API 키가 만료되었거나 유효하지 않습니다. 관리자에게 문의하세요.",
        };
      }
      if (error.statusCode === 500) {
        return {
          success: false,
          error: "서버 설정 오류입니다. 관리자에게 문의하세요.",
        };
      }
    }
    return {
      success: false,
      error: "라이엇 API 오류가 발생했습니다.",
    };
  }
}
