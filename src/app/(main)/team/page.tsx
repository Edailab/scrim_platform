import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTeamWithMembers } from "@/lib/queries/team";
import { TeamDashboard } from "@/components/team/team-dashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Users } from "lucide-react";

export default async function TeamPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  // If user has no team, show create team prompt
  if (!profile?.team_id) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>팀이 없습니다</CardTitle>
            <CardDescription>
              팀을 생성하거나 초대 링크를 통해 팀에 가입하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/team/create">팀 생성하기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get team with members
  const team = await getTeamWithMembers(profile.team_id);

  if (!team) {
    redirect("/team/create");
  }

  return <TeamDashboard team={team} members={team.members} currentUserId={user.id} />;
}
