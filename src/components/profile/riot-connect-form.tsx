"use client";

import { useState } from "react";
import { connectRiotAccount } from "@/lib/actions/riot";
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
import { Gamepad2 } from "lucide-react";

export function RiotConnectForm() {
  const [riotId, setRiotId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await connectRiotAccount(riotId);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      // Success - page will be revalidated
      window.location.reload();
    }
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {isLoading ? "인증 중..." : "계정 연결"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
