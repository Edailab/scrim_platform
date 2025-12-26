"use client";

import { TeamRanking } from "@/lib/queries/ranking";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Trophy } from "lucide-react";

interface TeamRankingListProps {
  teams: TeamRanking[];
}

function getRankBadge(rank: number) {
  if (rank === 1) return <Badge className="bg-yellow-500">1위</Badge>;
  if (rank === 2) return <Badge className="bg-gray-400">2위</Badge>;
  if (rank === 3) return <Badge className="bg-amber-600">3위</Badge>;
  return <Badge variant="outline">{rank}위</Badge>;
}

export function TeamRankingList({ teams }: TeamRankingListProps) {
  if (teams.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          등록된 팀이 없습니다.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {teams.map((team) => {
        const totalGames = team.win_count + team.loss_count;

        return (
          <Card key={team.id}>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-16 text-center">
                  {getRankBadge(team.rank)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{team.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {team.region_depth1} {team.region_depth2}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="font-bold">
                        {team.win_count}승 {team.loss_count}패
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {totalGames > 0 ? `${Math.round(team.winRate)}%` : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
