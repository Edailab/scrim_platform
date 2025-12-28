import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TeamCreateForm } from "@/components/team/team-create-form";

export default async function TeamCreatePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user already has a team
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user!.id)
    .single();

  if (profile?.team_id) {
    redirect("/team");
  }

  return (
    <div className="py-8">
      <TeamCreateForm />
    </div>
  );
}
