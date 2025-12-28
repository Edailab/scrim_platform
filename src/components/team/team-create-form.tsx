"use client";

import { useState, useMemo } from "react";
import { createTeam } from "@/lib/actions/team";
import {
  getRegionDepth1List,
  getRegionDepth2List,
  getRegionDepth3List,
} from "@/lib/data/regions";
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

export function TeamCreateForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [regionDepth1, setRegionDepth1] = useState("");
  const [regionDepth2, setRegionDepth2] = useState("");
  const [regionDepth3, setRegionDepth3] = useState("");

  const depth1List = getRegionDepth1List();

  const depth2List = useMemo(() => {
    if (!regionDepth1) return [];
    return getRegionDepth2List(regionDepth1);
  }, [regionDepth1]);

  const depth3List = useMemo(() => {
    if (!regionDepth1 || !regionDepth2) return [];
    return getRegionDepth3List(regionDepth1, regionDepth2);
  }, [regionDepth1, regionDepth2]);

  function handleDepth1Change(value: string) {
    setRegionDepth1(value);
    setRegionDepth2("");
    setRegionDepth3("");
  }

  function handleDepth2Change(value: string) {
    setRegionDepth2(value);
    setRegionDepth3("");
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    formData.set("region_depth1", regionDepth1);
    formData.set("region_depth2", regionDepth2);
    formData.set("region_depth3", regionDepth3);

    const result = await createTeam(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>팀 생성</CardTitle>
        <CardDescription>
          새로운 팀을 만들고 스크림 매칭을 시작하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">팀 이름</Label>
            <Input
              id="name"
              name="name"
              placeholder="팀 이름을 입력하세요"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>지역 선택</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={regionDepth1}
                onValueChange={handleDepth1Change}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="시/도" />
                </SelectTrigger>
                <SelectContent>
                  {depth1List.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={regionDepth2}
                onValueChange={handleDepth2Change}
                disabled={isLoading || !regionDepth1}
              >
                <SelectTrigger>
                  <SelectValue placeholder="구/시/군" />
                </SelectTrigger>
                <SelectContent>
                  {depth2List.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={regionDepth3}
                onValueChange={setRegionDepth3}
                disabled={isLoading || !regionDepth2}
              >
                <SelectTrigger>
                  <SelectValue placeholder="동/읍/면" />
                </SelectTrigger>
                <SelectContent>
                  {depth3List.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_link">연락 링크</Label>
            <Input
              id="contact_link"
              name="contact_link"
              placeholder="Discord 또는 오픈카톡 링크"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              경기 수락 시 상대 팀에게 공개됩니다
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !regionDepth3}
          >
            {isLoading ? "생성 중..." : "팀 생성하기"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
