"use client";

import { useState } from "react";
import { Database } from "@/types/database";
import { refreshRiotData } from "@/lib/actions/riot";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, RefreshCw, Trophy, TrendingUp } from "lucide-react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileDisplayProps {
  profile: Profile;
}

const tierColors: Record<string, string> = {
  IRON: "bg-gray-400",
  BRONZE: "bg-amber-700",
  SILVER: "bg-gray-300",
  GOLD: "bg-yellow-500",
  PLATINUM: "bg-cyan-400",
  EMERALD: "bg-emerald-500",
  DIAMOND: "bg-blue-400",
  MASTER: "bg-purple-500",
  GRANDMASTER: "bg-red-500",
  CHALLENGER: "bg-yellow-300",
};

const tierNames: Record<string, string> = {
  IRON: "아이언",
  BRONZE: "브론즈",
  SILVER: "실버",
  GOLD: "골드",
  PLATINUM: "플래티넘",
  EMERALD: "에메랄드",
  DIAMOND: "다이아몬드",
  MASTER: "마스터",
  GRANDMASTER: "그랜드마스터",
  CHALLENGER: "챌린저",
};

export function ProfileDisplay({ profile }: ProfileDisplayProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRefresh() {
    setIsRefreshing(true);
    setError(null);

    const result = await refreshRiotData();

    if (result.error) {
      setError(result.error);
    }
    setIsRefreshing(false);
  }

  const tierColor = profile.tier ? tierColors[profile.tier] || "bg-gray-500" : "bg-gray-500";
  const tierName = profile.tier ? tierNames[profile.tier] || profile.tier : "";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              라이엇 계정
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
              새로고침
            </Button>
          </div>
          <CardDescription>
            {profile.riot_game_name}#{profile.riot_tag_line}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-sm text-destructive mb-4">{error}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                솔로 랭크
              </p>
              <div className="flex items-center gap-2">
                <Badge className={tierColor}>
                  {tierName} {profile.tier_rank}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {profile.tier_lp} LP
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                소환사 레벨
              </p>
              <p className="font-semibold">{profile.summoner_level}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        마지막 인증: {profile.riot_verified_at ? new Date(profile.riot_verified_at).toLocaleString("ko-KR") : "-"}
      </p>
    </div>
  );
}
