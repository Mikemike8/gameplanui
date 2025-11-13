// src/components/Workspace/JoinWorkspaceForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface JoinWorkspaceFormProps {
  userId: string;
  className?: string;
}

export const JoinWorkspaceForm = ({
  userId,
  className,
}: JoinWorkspaceFormProps) => {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/workspaces/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invite_code: inviteCode.trim(),
          user_id: userId,
        }),
      });

      if (!res.ok) {
        throw new Error("Invalid or expired invite code");
      }

      const data = await res.json();
      const workspaceId = data.workspace_id;

      router.push(`/protected/workspace/${workspaceId}`);
    } catch (err: any) {
      setError(err.message ?? "Failed to join workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className={cn("space-y-3 bg-white border rounded-md p-4", className)}
    >
      <div className="space-y-1.5">
        <Label htmlFor="invite-code">Join with invite code</Label>
        <Input
          id="invite-code"
          placeholder="Paste your invite code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          disabled={loading}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading || !inviteCode.trim()}
        className="w-full"
        variant="outline"
      >
        {loading ? "Joining..." : "Join Space"}
      </Button>
    </form>
  );
};
