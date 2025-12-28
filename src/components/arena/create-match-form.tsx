"use client";

import { useState } from "react";
import { createMatch } from "@/lib/actions/match";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const tiers = [
  "아이언",
  "브론즈",
  "실버",
  "골드",
  "플래티넘",
  "에메랄드",
  "다이아몬드",
  "마스터",
  "그랜드마스터",
  "챌린저",
];

export function CreateMatchForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [targetTier, setTargetTier] = useState("ALL");

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    formData.set("target_tier", targetTier);

    const result = await createMatch(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  // Default to tomorrow at 8pm
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(20, 0, 0, 0);
  const defaultDateTime = tomorrow.toISOString().slice(0, 16);

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>격문 쓰기</CardTitle>
        <CardDescription>상대 팀을 찾아 스크림을 신청하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scheduled_at">경기 예정 시간</Label>
            <Input
              id="scheduled_at"
              name="scheduled_at"
              type="datetime-local"
              defaultValue={defaultDateTime}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>목표 티어 (선택)</Label>
            <Select value={targetTier} onValueChange={setTargetTier}>
              <SelectTrigger>
                <SelectValue placeholder="티어 무관" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">티어 무관</SelectItem>
                {tiers.map((tier) => (
                  <SelectItem key={tier} value={tier}>
                    {tier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              특정 티어의 팀만 도전할 수 있도록 제한합니다
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "등록 중..." : "격문 올리기"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
