import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users } from "lucide-react";
import { JoinTeamButton } from "./join-button";

interface InvitePageProps {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login with return URL
    redirect(`/login?redirect=/team/invite/${code}`);
  }

  // Check if user already has a team
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (profile?.team_id) {
    redirect("/team");
  }

  // Find team by invite code
  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("invite_code", code.toUpperCase())
    .single();

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">유효하지 않은 초대</CardTitle>
            <CardDescription>
              초대 코드가 올바르지 않거나 만료되었습니다.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Get member count
  const { count: memberCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("team_id", team.id);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <Badge variant="secondary" className="w-fit mx-auto mb-2">
            팀 초대
          </Badge>
          <CardTitle className="text-2xl">{team.name}</CardTitle>
          <CardDescription className="flex items-center justify-center gap-1">
            <MapPin className="h-4 w-4" />
            {team.region_depth1} {team.region_depth2} {team.region_depth3}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{memberCount || 0}명</span>
            </div>
            <span>•</span>
            <span>{team.win_count}승 {team.loss_count}패</span>
          </div>

          <JoinTeamButton code={code} teamName={team.name} />
        </CardContent>
      </Card>
    </div>
  );
}
