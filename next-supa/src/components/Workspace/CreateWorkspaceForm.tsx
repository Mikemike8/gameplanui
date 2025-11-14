// src/components/Workspace/CreateWorkspaceForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createWorkspace } from "@/lib/workspaces";

interface CreateWorkspaceFormProps {
  userId: string;
  className?: string;
}

export function CreateWorkspaceForm({
  userId,
  className,
}: CreateWorkspaceFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setError("Workspace name is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createWorkspace(userId, {
        name: trimmedName,
        description: trimmedDescription || undefined,
        is_personal: false,
      });

      router.push(`/protected/workspace/${res.workspace_id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create workspace.";
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
        <Label htmlFor="ws-name">Workspace name</Label>
        <Input
          id="ws-name"
          placeholder="e.g. Marketing, Engineering, Product"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ws-description">Description (optional)</Label>
        <Textarea
          id="ws-description"
          placeholder="Short description of this space"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
        disabled={loading || !name.trim()}
        className="w-full"
      >
        {loading ? "Creating..." : "Create Workspace"}
      </Button>
    </form>
  );
}
