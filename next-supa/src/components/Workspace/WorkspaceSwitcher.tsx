// src/components/Workspace/WorkspaceSwitcher.tsx
"use client";

import { useRouter } from "next/navigation";
import { WorkspaceSummary } from "@/lib/workspaces";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WorkspaceSwitcherProps {
  workspaces: WorkspaceSummary[];
  currentWorkspaceId?: string;
}

export const WorkspaceSwitcher = ({
  workspaces,
  currentWorkspaceId,
}: WorkspaceSwitcherProps) => {
  const router = useRouter();

  if (!workspaces.length) return null;

  const handleChange = (value: string) => {
    router.push(`/protected/workspace/${value}`);
  };

  return (
    <Select
      defaultValue={currentWorkspaceId ?? workspaces[0]?.id}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Select a space" />
      </SelectTrigger>
      <SelectContent>
        {workspaces.map((ws) => (
          <SelectItem key={ws.id} value={ws.id}>
            {ws.name} {ws.is_personal && "(Personal)"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
