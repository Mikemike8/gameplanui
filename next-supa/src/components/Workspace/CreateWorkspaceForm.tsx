// src/components/Workspace/CreateWorkspaceForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // if you don't have this, we can swap to Input
import { cn } from "@/lib/utils";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CreateWorkspaceFormProps {
  userId: string;
  className?: string;
}

export const CreateWorkspaceForm = ({
  userId,
  className,
}: CreateWorkspaceFormProps) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPersonal, setIsPersonal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${API_URL}/workspaces/create?user_id=${encodeURIComponent(userId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            is_personal: isPersonal,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to create workspace");
      }

      const data = await res.json();
      const workspaceId = data.workspace_id;

      router.push(`/protected/workspace/${workspaceId}`);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className={cn("space-y-4 bg-white border rounded-md p-4", className)}
    >
      <div className="space-y-1.5">
        <Label htmlFor="ws-name">Space name</Label>
        <Input
          id="ws-name"
          placeholder="e.g. Michael’s Workspace"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ws-description">Description (optional)</Label>
        {/* If you don't have Textarea, replace with <Input /> */}
        <Textarea
          id="ws-description"
          placeholder="What is this space used for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2 text-sm">
        <input
          id="ws-personal"
          type="checkbox"
          className="h-4 w-4"
          checked={isPersonal}
          onChange={(e) => setIsPersonal(e.target.checked)}
          disabled={loading}
        />
        <Label htmlFor="ws-personal">Mark as personal space</Label>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading || !name.trim()} className="w-full">
        {loading ? "Creating..." : "Create Space"}
      </Button>
    </form>
  );
};
