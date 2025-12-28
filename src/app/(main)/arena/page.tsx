import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function ArenaPage() {
  const supabase = await createClient();

  // Get user's team info
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user!.id)
    .single();

  const hasTeam = !!profile?.team_id;

  // Get open matches
  const { data: matches } = await supabase
    .from("matches")
    .select(
      `
      *,
      host_team:teams!host_team_id(*)
    `
    )
    .eq("status", "OPEN")
    .order("scheduled_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">아레나</h1>
          <p className="text-muted-foreground">상대 팀을 찾아 도전하세요</p>
        </div>
        {hasTeam ? (
          <Button asChild>
            <Link href="/arena/create">
              <Plus className="mr-2 h-4 w-4" />
              격문 쓰기
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href="/team/create">팀 생성하기</Link>
          </Button>
        )}
      </div>

      {!matches || matches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              아직 등록된 경기가 없습니다.
            </p>
            {hasTeam && (
              <Button asChild>
                <Link href="/arena/create">첫 격문을 올려보세요!</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => {
            const team = match.host_team as {
              name: string;
              region_depth1: string;
              region_depth2: string;
              win_count: number;
              loss_count: number;
            };
            const totalGames = team.win_count + team.loss_count;
            const winRate =
              totalGames > 0
                ? Math.round((team.win_count / totalGames) * 100)
                : 0;

            return (
              <Card key={match.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{match.target_tier || "전체"}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {team.region_depth1} {team.region_depth2}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p>
                      예정:{" "}
                      {new Date(match.scheduled_at).toLocaleString("ko-KR", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p>
                      승률: {winRate}% ({team.win_count}승 {team.loss_count}패)
                    </p>
                  </div>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/arena/${match.id}`}>도전하기</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
