"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InviteCodeClient({ inviteCode }: { inviteCode: string }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input id="invite-code" value={inviteCode} readOnly className="font-mono bg-muted" />

        <Button onClick={() => navigator.clipboard.writeText(inviteCode)}>Copy</Button>
      </div>
    </div>
  );
}
