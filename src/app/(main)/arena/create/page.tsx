import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateMatchForm } from "@/components/arena/create-match-form";

export default async function CreateMatchPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user's profile and team
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user!.id)
    .single();

  if (!profile?.team_id) {
    redirect("/team/create");
  }

  // Check if user is captain
  const { data: team } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", profile.team_id)
    .single();

  if (team?.captain_id !== user!.id) {
    redirect("/arena");
  }

  return (
    <div className="py-8">
      <CreateMatchForm />
    </div>
  );
}
