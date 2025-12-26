"use client";

import { AreaRanking } from "@/lib/queries/ranking";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Trophy } from "lucide-react";

interface AreaRankingListProps {
  areas: AreaRanking[];
}

function getRankBadge(rank: number) {
  if (rank === 1) return <Badge className="bg-yellow-500">1위</Badge>;
  if (rank === 2) return <Badge className="bg-gray-400">2위</Badge>;
  if (rank === 3) return <Badge className="bg-amber-600">3위</Badge>;
  return <Badge variant="outline">{rank}위</Badge>;
}

export function AreaRankingList({ areas }: AreaRankingListProps) {
  if (areas.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          등록된 지역이 없습니다.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {areas.map((area) => {
        const totalGames = area.totalWins + area.totalLosses;

        return (
          <Card key={`${area.regionDepth1}-${area.regionDepth2}`}>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-16 text-center">
                  {getRankBadge(area.rank)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">
                      {area.regionDepth1} {area.regionDepth2}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Users className="h-3 w-3" />
                    <span>{area.teamCount}개 팀</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="font-bold">
                        {area.totalWins}승 {area.totalLosses}패
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      평균 {totalGames > 0 ? `${Math.round(area.avgWinRate)}%` : "-"}
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
