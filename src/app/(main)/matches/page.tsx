import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyMatches } from "@/lib/queries/match";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Trophy } from "lucide-react";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  OPEN: { label: "대기중", variant: "default" },
  MATCHED: { label: "매칭됨", variant: "secondary" },
  PENDING_RESULT: { label: "결과 대기", variant: "outline" },
  COMPLETED: { label: "완료", variant: "secondary" },
  DISPUTED: { label: "분쟁중", variant: "destructive" },
};

export default async function MatchesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const matches = await getMyMatches();

  const activeMatches = matches.filter(
    (m) => m.status === "OPEN" || m.status === "MATCHED" || m.status === "PENDING_RESULT"
  );
  const completedMatches = matches.filter(
    (m) => m.status === "COMPLETED" || m.status === "DISPUTED"
  );

  // Get user's team
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">내 경기</h1>
        <p className="text-muted-foreground">진행 중인 경기와 완료된 경기</p>
      </div>

      {!profile?.team_id ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              팀에 가입해야 경기를 볼 수 있습니다.
            </p>
            <Button asChild>
              <Link href="/team/create">팀 생성하기</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              진행중 ({activeMatches.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              완료됨 ({completedMatches.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-4">
            {activeMatches.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  진행 중인 경기가 없습니다
                </CardContent>
              </Card>
            ) : (
              activeMatches.map((match) => {
                const isHost = match.host_team_id === profile.team_id;
                const opponent = isHost ? match.challenger_team : match.host_team;
                const status = statusLabels[match.status];

                return (
                  <Card key={match.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {isHost ? "주최" : "도전"}
                        </span>
                      </div>
                      <CardTitle className="text-lg">
                        vs {opponent?.name || "대기중..."}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(match.scheduled_at).toLocaleString("ko-KR", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <Button className="w-full" variant="outline" asChild>
                        <Link href={`/arena/${match.id}`}>상세 보기</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-4">
            {completedMatches.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  완료된 경기가 없습니다
                </CardContent>
              </Card>
            ) : (
              completedMatches.map((match) => {
                const isHost = match.host_team_id === profile.team_id;
                const opponent = isHost ? match.challenger_team : match.host_team;
                const isWinner = match.winner_team_id === profile.team_id;
                const status = statusLabels[match.status];

                return (
                  <Card key={match.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        {match.status === "COMPLETED" && (
                          <div className="flex items-center gap-1">
                            {isWinner && <Trophy className="h-4 w-4 text-yellow-500" />}
                            <span
                              className={`text-sm font-medium ${
                                isWinner ? "text-primary" : "text-muted-foreground"
                              }`}
                            >
                              {isWinner ? "승리" : "패배"}
                            </span>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg">
                        vs {opponent?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(match.scheduled_at).toLocaleString("ko-KR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
