"use client";

import { useState } from "react";
import {
  initiateVerification,
  confirmVerification,
  cancelVerification,
} from "@/lib/actions/riot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gamepad2, ArrowLeft, CheckCircle2 } from "lucide-react";

// Data Dragon URL for profile icons
const DDRAGON_VERSION = "14.24.1";
const getIconUrl = (iconId: number) =>
  `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${iconId}.png`;

type Step = "input" | "verify";

interface VerificationData {
  requiredIconId: number;
  gameName: string;
  tagLine: string;
}

export function RiotConnectForm() {
  const [step, setStep] = useState<Step>("input");
  const [riotId, setRiotId] = useState("");
  const [verificationData, setVerificationData] =
    useState<VerificationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleInitiate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await initiateVerification(riotId);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result.success && result.requiredIconId) {
      setVerificationData({
        requiredIconId: result.requiredIconId,
        gameName: result.gameName!,
        tagLine: result.tagLine!,
      });
      setStep("verify");
      setIsLoading(false);
    }
  }

  async function handleConfirm() {
    setIsLoading(true);
    setError(null);

    const result = await confirmVerification();

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      // Success - page will be revalidated
      window.location.reload();
    }
  }

  async function handleCancel() {
    setIsLoading(true);
    await cancelVerification();
    setStep("input");
    setVerificationData(null);
    setError(null);
    setIsLoading(false);
  }

  if (step === "verify" && verificationData) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">계정 인증</CardTitle>
          <CardDescription>
            {verificationData.gameName}#{verificationData.tagLine}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              계정 소유권을 확인하기 위해 아래 아이콘으로 프로필 아이콘을
              변경해주세요.
            </p>

            <div className="flex flex-col items-center gap-2">
              <img
                src={getIconUrl(verificationData.requiredIconId)}
                alt="Required icon"
                className="w-24 h-24 rounded-lg border-2 border-primary shadow-lg"
              />
              <p className="text-xs text-muted-foreground">
                아이콘 ID: {verificationData.requiredIconId}
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg text-sm text-left space-y-2">
              <p className="font-medium">변경 방법:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>리그 오브 레전드 클라이언트 실행</li>
                <li>프로필 → 아이콘 변경 클릭</li>
                <li>위 아이콘으로 변경 후 저장</li>
                <li>아래 &quot;인증 확인&quot; 버튼 클릭</li>
              </ol>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <div className="space-y-2">
            <Button
              onClick={handleConfirm}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "확인 중..." : "인증 확인"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="w-full"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              다시 시작
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
          <Gamepad2 className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">라이엇 계정 연결</CardTitle>
        <CardDescription>
          서비스를 이용하려면 라이엇 계정을 연결해야 합니다.
          <br />
          레벨 30 이상, 랭크 배치 완료 계정만 가능합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInitiate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="riot_id">라이엇 ID</Label>
            <Input
              id="riot_id"
              placeholder="소환사명#KR1"
              value={riotId}
              onChange={(e) => setRiotId(e.target.value)}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              게임 내 이름과 태그를 입력하세요 (예: Faker#KR1)
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "확인 중..." : "인증 시작"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
