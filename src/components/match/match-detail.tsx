"use client";

import { useState } from "react";
import Link from "next/link";
import { MatchWithTeams } from "@/lib/queries/match";
import { acceptMatch, cancelMatch } from "@/lib/actions/match";
import { reportResult, confirmResult, disputeResult } from "@/lib/actions/result";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Calendar,
  Trophy,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  OPEN: { label: "대기중", variant: "default" },
  MATCHED: { label: "매칭됨", variant: "secondary" },
  PENDING_RESULT: { label: "결과 대기", variant: "outline" },
  COMPLETED: { label: "완료", variant: "secondary" },
  DISPUTED: { label: "분쟁중", variant: "destructive" },
};

interface MatchDetailProps {
  match: MatchWithTeams;
  currentUserId: string;
  currentTeamId: string | null;
}

export function MatchDetail({
  match,
  currentUserId,
  currentTeamId,
}: MatchDetailProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactLink, setContactLink] = useState<string | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);

  const isHostTeam = currentTeamId === match.host_team_id;
  const isChallengerTeam = currentTeamId === match.challenger_team_id;
  const isParticipant = isHostTeam || isChallengerTeam;
  const isHostCaptain = match.host_team.captain_id === currentUserId;

  const hostTeam = match.host_team;
  const challengerTeam = match.challenger_team;

  const status = statusLabels[match.status];

  async function handleAccept() {
    if (!currentTeamId) {
      setError("팀에 소속되어 있어야 합니다.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await acceptMatch(match.id);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result.contactLink) {
      setContactLink(result.contactLink);
      setShowContactDialog(true);
      setIsLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm("정말 이 격문을 취소하시겠습니까?")) return;

    setIsLoading(true);
    setError(null);

    const result = await cancelMatch(match.id);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  async function handleReportResult(isWin: boolean) {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("result", isWin ? "win" : "loss");

    const result = await reportResult(match.id, formData);

    if (result.error) {
      setError(result.error);
    }
    setIsLoading(false);
  }

  async function handleConfirmResult() {
    setIsLoading(true);
    setError(null);

    const result = await confirmResult(match.id);

    if (result.error) {
      setError(result.error);
    }
    setIsLoading(false);
  }

  async function handleDisputeResult() {
    if (!confirm("결과에 이의를 제기하시겠습니까?")) return;

    setIsLoading(true);
    setError(null);

    const result = await disputeResult(match.id);

    if (result.error) {
      setError(result.error);
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/arena">
          <ArrowLeft className="mr-2 h-4 w-4" />
          아레나로 돌아가기
        </Link>
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">경기 상세</h1>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Host Team */}
        <Card>
          <CardHeader>
            <CardDescription>주최 팀</CardDescription>
            <CardTitle className="flex items-center gap-2">
              {hostTeam.name}
              {match.winner_team_id === hostTeam.id && (
                <Trophy className="h-5 w-5 text-yellow-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {hostTeam.region_depth1} {hostTeam.region_depth2}
            </div>
            <p>
              전적: {hostTeam.win_count}승 {hostTeam.loss_count}패
            </p>
          </CardContent>
        </Card>

        {/* Challenger Team */}
        <Card>
          <CardHeader>
            <CardDescription>도전 팀</CardDescription>
            <CardTitle className="flex items-center gap-2">
              {challengerTeam ? (
                <>
                  {challengerTeam.name}
                  {match.winner_team_id === challengerTeam.id && (
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">대기중...</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {challengerTeam ? (
              <>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {challengerTeam.region_depth1} {challengerTeam.region_depth2}
                </div>
                <p>
                  전적: {challengerTeam.win_count}승 {challengerTeam.loss_count}패
                </p>
              </>
            ) : (
              <p>아직 도전한 팀이 없습니다</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Match Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>
              예정 시간:{" "}
              {new Date(match.scheduled_at).toLocaleString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {match.target_tier && (
            <div className="mt-2">
              <Badge variant="outline">{match.target_tier}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          {/* OPEN status - can accept or cancel */}
          {match.status === "OPEN" && !isHostTeam && currentTeamId && (
            <Button
              className="w-full"
              onClick={handleAccept}
              disabled={isLoading}
            >
              {isLoading ? "처리 중..." : "도전하기"}
            </Button>
          )}

          {match.status === "OPEN" && isHostCaptain && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {isLoading ? "처리 중..." : "격문 취소"}
            </Button>
          )}

          {/* MATCHED status - show contact and result report */}
          {match.status === "MATCHED" && isParticipant && (
            <>
              {isHostTeam && challengerTeam && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">상대 팀 연락처</p>
                  <a
                    href={challengerTeam.contact_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {challengerTeam.contact_link}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {isChallengerTeam && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">상대 팀 연락처</p>
                  <a
                    href={hostTeam.contact_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {hostTeam.contact_link}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              <Separator />
              <p className="text-sm text-center text-muted-foreground">
                경기 결과를 보고해주세요
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="default"
                  onClick={() => handleReportResult(true)}
                  disabled={isLoading}
                >
                  승리
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReportResult(false)}
                  disabled={isLoading}
                >
                  패배
                </Button>
              </div>
            </>
          )}

          {/* PENDING_RESULT status - confirm or dispute */}
          {match.status === "PENDING_RESULT" && isParticipant && (
            <>
              <p className="text-sm text-center">
                {match.winner_team_id === currentTeamId
                  ? "상대 팀이 결과를 확인하면 완료됩니다"
                  : "상대 팀이 승리를 주장했습니다. 결과를 확인해주세요."}
              </p>
              {match.winner_team_id !== currentTeamId && (
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleConfirmResult} disabled={isLoading}>
                    결과 확인
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDisputeResult}
                    disabled={isLoading}
                  >
                    이의 제기
                  </Button>
                </div>
              )}
            </>
          )}

          {/* COMPLETED status */}
          {match.status === "COMPLETED" && (
            <p className="text-center text-muted-foreground">
              경기가 완료되었습니다
            </p>
          )}

          {/* DISPUTED status */}
          {match.status === "DISPUTED" && (
            <p className="text-center text-destructive">
              분쟁 중인 경기입니다. 관리자 검토가 필요합니다.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>도전 수락 완료!</DialogTitle>
            <DialogDescription>
              아래 링크로 상대 팀에 연락하세요
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted rounded-lg">
            <a
              href={contactLink || ""}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              {contactLink}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <Button asChild>
            <Link href="/matches">내 경기 보기</Link>
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
