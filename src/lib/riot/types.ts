// Riot Account API response
export interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

// Summoner API response
export interface Summoner {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

// League Entry API response
export interface LeagueEntry {
  leagueId: string;
  summonerId: string;
  queueType: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR" | string;
  tier: RiotTier;
  rank: RiotRank;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
}

export type RiotTier =
  | "IRON"
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "EMERALD"
  | "DIAMOND"
  | "MASTER"
  | "GRANDMASTER"
  | "CHALLENGER";

export type RiotRank = "I" | "II" | "III" | "IV";

// Verification result
export interface RiotVerificationResult {
  success: boolean;
  error?: string;
  data?: {
    puuid: string;
    gameName: string;
    tagLine: string;
    summonerLevel: number;
    tier: RiotTier;
    rank: RiotRank;
    leaguePoints: number;
  };
}
