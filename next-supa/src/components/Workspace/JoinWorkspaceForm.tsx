// src/components/Workspace/JoinWorkspaceForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ggameplan-backend.onrender.com";

interface JoinWorkspaceFormProps {
  userId: string;
  className?: string;
}

export const JoinWorkspaceForm = ({ userId, className }: JoinWorkspaceFormProps) => {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedCode = inviteCode.trim();
    if (!trimmedCode) {
      setError("Invite code cannot be empty.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/workspaces/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invite_code: trimmedCode,
          user_id: userId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Invalid or expired invite code.");
      }

      const data = await res.json();
      router.push(`/protected/workspace/${data.workspace_id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to join workspace.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className={cn("space-y-5 bg-white border rounded-md p-6 shadow-sm", className)}
    >
      <div className="space-y-2">
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
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !inviteCode.trim()}
        className="w-full"
        variant="outline"
      >
        {loading ? "Joining..." : "Join Workspace"}
      </Button>
    </form>
  );
};
