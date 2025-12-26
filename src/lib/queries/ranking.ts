import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";

type Team = Database["public"]["Tables"]["teams"]["Row"];

export interface TeamRanking extends Team {
  winRate: number;
  rank: number;
}

export interface AreaRanking {
  regionDepth1: string;
  regionDepth2: string;
  teamCount: number;
  totalWins: number;
  totalLosses: number;
  avgWinRate: number;
  rank: number;
}

export async function getTeamRankings(
  regionDepth1?: string,
  regionDepth2?: string
): Promise<TeamRanking[]> {
  const supabase = await createClient();

  let query = supabase.from("teams").select("*");

  if (regionDepth1) {
    query = query.eq("region_depth1", regionDepth1);
  }
  if (regionDepth2) {
    query = query.eq("region_depth2", regionDepth2);
  }

  const { data: teams } = await query;

  if (!teams) return [];

  // Calculate win rate and sort
  const rankedTeams = teams
    .map((team) => {
      const totalGames = team.win_count + team.loss_count;
      const winRate = totalGames > 0 ? (team.win_count / totalGames) * 100 : 0;
      return { ...team, winRate };
    })
    .sort((a, b) => {
      // Sort by wins first, then by win rate
      if (b.win_count !== a.win_count) {
        return b.win_count - a.win_count;
      }
      return b.winRate - a.winRate;
    })
    .map((team, index) => ({ ...team, rank: index + 1 }));

  return rankedTeams;
}

export async function getAreaRankings(): Promise<AreaRanking[]> {
  const supabase = await createClient();

  const { data: teams } = await supabase.from("teams").select("*");

  if (!teams) return [];

  // Group by region
  const areaMap = new Map<
    string,
    {
      regionDepth1: string;
      regionDepth2: string;
      teams: Team[];
    }
  >();

  teams.forEach((team) => {
    const key = `${team.region_depth1}-${team.region_depth2}`;
    if (!areaMap.has(key)) {
      areaMap.set(key, {
        regionDepth1: team.region_depth1,
        regionDepth2: team.region_depth2,
        teams: [],
      });
    }
    areaMap.get(key)!.teams.push(team);
  });

  // Calculate area stats
  const areaRankings = Array.from(areaMap.values())
    .map((area) => {
      const totalWins = area.teams.reduce((sum, t) => sum + t.win_count, 0);
      const totalLosses = area.teams.reduce((sum, t) => sum + t.loss_count, 0);
      const totalGames = totalWins + totalLosses;
      const avgWinRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

      return {
        regionDepth1: area.regionDepth1,
        regionDepth2: area.regionDepth2,
        teamCount: area.teams.length,
        totalWins,
        totalLosses,
        avgWinRate,
        rank: 0,
      };
    })
    .sort((a, b) => {
      // Sort by total wins first, then by win rate
      if (b.totalWins !== a.totalWins) {
        return b.totalWins - a.totalWins;
      }
      return b.avgWinRate - a.avgWinRate;
    })
    .map((area, index) => ({ ...area, rank: index + 1 }));

  return areaRankings;
}
