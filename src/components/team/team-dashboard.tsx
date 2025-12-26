"use client";

import { Database } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TeamRoster } from "./team-roster";
import { leaveTeam } from "@/lib/actions/team";
import { MapPin, Link as LinkIcon, Trophy, UserPlus, Copy, Check } from "lucide-react";
import { useState } from "react";
import { getInviteLink } from "@/lib/utils/invite";

type Team = Database["public"]["Tables"]["teams"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface TeamDashboardProps {
  team: Team;
  members: Profile[];
  currentUserId: string;
}

export function TeamDashboard({
  team,
  members,
  currentUserId,
}: TeamDashboardProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const isCaptain = team.captain_id === currentUserId;
  const totalGames = team.win_count + team.loss_count;
  const winRate =
    totalGames > 0 ? Math.round((team.win_count / totalGames) * 100) : 0;
  const inviteLink = getInviteLink(team.invite_code);

  async function copyToClipboard(text: string, type: "code" | "link") {
    await navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }

  async function handleLeaveTeam() {
    if (
      !confirm(
        "정말 팀을 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    ) {
      return;
    }

    setIsLeaving(true);
    const result = await leaveTeam();
    if (result?.error) {
      alert(result.error);
      setIsLeaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <MapPin className="h-4 w-4" />
            <span>
              {team.region_depth1} {team.region_depth2} {team.region_depth3}
            </span>
          </div>
        </div>
        {isCaptain && <Badge>팀장</Badge>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              전적
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-around text-center">
              <div>
                <p className="text-3xl font-bold text-primary">
                  {team.win_count}
                </p>
                <p className="text-sm text-muted-foreground">승</p>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div>
                <p className="text-3xl font-bold text-destructive">
                  {team.loss_count}
                </p>
                <p className="text-sm text-muted-foreground">패</p>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div>
                <p className="text-3xl font-bold">{winRate}%</p>
                <p className="text-sm text-muted-foreground">승률</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              연락처
            </CardTitle>
            <CardDescription>경기 수락 시 상대 팀에게 공개</CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href={team.contact_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {team.contact_link}
            </a>
          </CardContent>
        </Card>
      </div>

      {isCaptain && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              팀원 초대
            </CardTitle>
            <CardDescription>
              초대 코드나 링크를 팀원에게 공유하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">초대 코드</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded-md font-mono text-lg tracking-wider">
                  {team.invite_code}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(team.invite_code, "code")}
                >
                  {copiedCode ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">초대 링크</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm truncate">
                  {inviteLink}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(inviteLink, "link")}
                >
                  {copiedLink ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <TeamRoster members={members} captainId={team.captain_id} />

      {!isCaptain && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <Button
              variant="destructive"
              onClick={handleLeaveTeam}
              disabled={isLeaving}
              className="w-full"
            >
              {isLeaving ? "탈퇴 중..." : "팀 탈퇴"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
