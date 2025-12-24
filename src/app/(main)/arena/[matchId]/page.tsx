import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMatchById } from "@/lib/queries/match";
import { MatchDetail } from "@/components/match/match-detail";

interface PageProps {
  params: Promise<{ matchId: string }>;
}

export default async function MatchDetailPage({ params }: PageProps) {
  const { matchId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const match = await getMatchById(matchId);

  if (!match) {
    notFound();
  }

  // Get user's team
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  const teamId = profile?.team_id ?? null;

  return (
    <MatchDetail
      match={match}
      currentUserId={user.id}
      currentTeamId={teamId}
    />
  );
}
