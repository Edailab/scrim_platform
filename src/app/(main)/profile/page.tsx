import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RiotConnectForm } from "@/components/profile/riot-connect-form";
import { ProfileDisplay } from "@/components/profile/profile-display";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // If not verified, show connect form
  if (!profile?.riot_verified_at) {
    return (
      <div className="py-12">
        <RiotConnectForm />
      </div>
    );
  }

  // Show profile display
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">내 프로필</h1>
        <p className="text-muted-foreground">라이엇 계정 정보</p>
      </div>
      <ProfileDisplay profile={profile} />
    </div>
  );
}
