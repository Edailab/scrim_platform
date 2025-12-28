import { Database } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const positionLabels: Record<string, string> = {
  TOP: "탑",
  JUNGLE: "정글",
  MID: "미드",
  ADC: "원딜",
  SUP: "서포터",
};

const positionColors: Record<string, string> = {
  TOP: "bg-red-500/10 text-red-500",
  JUNGLE: "bg-green-500/10 text-green-500",
  MID: "bg-blue-500/10 text-blue-500",
  ADC: "bg-yellow-500/10 text-yellow-500",
  SUP: "bg-purple-500/10 text-purple-500",
};

interface TeamRosterProps {
  members: Profile[];
  captainId: string;
}

export function TeamRoster({ members, captainId }: TeamRosterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">로스터</CardTitle>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            아직 팀원이 없습니다
          </p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.summoner_name || "소환사명 미등록"}
                    </p>
                    {member.id === captainId && (
                      <span className="text-xs text-primary">팀장</span>
                    )}
                  </div>
                </div>
                {member.position && (
                  <Badge
                    variant="secondary"
                    className={positionColors[member.position]}
                  >
                    {positionLabels[member.position]}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
