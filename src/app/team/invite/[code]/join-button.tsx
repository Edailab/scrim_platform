"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { joinTeamByCode } from "@/lib/actions/team";

interface JoinTeamButtonProps {
  code: string;
  teamName: string;
}

export function JoinTeamButton({ code, teamName }: JoinTeamButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setIsLoading(true);
    setError(null);

    const result = await joinTeamByCode(code);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
      <Button onClick={handleJoin} disabled={isLoading} className="w-full">
        {isLoading ? "가입 중..." : `${teamName} 팀에 가입하기`}
      </Button>
    </div>
  );
}
