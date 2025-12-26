import { getTeamRankings, getAreaRankings } from "@/lib/queries/ranking";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamRankingList } from "@/components/ranking/team-ranking-list";
import { AreaRankingList } from "@/components/ranking/area-ranking-list";
import { Trophy, MapPin } from "lucide-react";

export default async function RankingPage() {
  const [teamRankings, areaRankings] = await Promise.all([
    getTeamRankings(),
    getAreaRankings(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">랭킹</h1>
        <p className="text-muted-foreground">팀과 지역의 순위를 확인하세요</p>
      </div>

      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            팀 순위
          </TabsTrigger>
          <TabsTrigger value="areas" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            지역 순위
          </TabsTrigger>
        </TabsList>
        <TabsContent value="teams" className="mt-4">
          <TeamRankingList teams={teamRankings} />
        </TabsContent>
        <TabsContent value="areas" className="mt-4">
          <AreaRankingList areas={areaRankings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
