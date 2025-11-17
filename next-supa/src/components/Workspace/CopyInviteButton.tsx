// src/components/Workspace/CopyInviteButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CopyInviteButtonProps {
  inviteCode: string;
}

export function CopyInviteButton({ inviteCode }: CopyInviteButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button onClick={handleCopy} type="button">
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}
