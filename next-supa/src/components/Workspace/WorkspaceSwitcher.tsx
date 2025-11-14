"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WorkspaceSummary } from "@/lib/workspaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkspaceSwitcherProps {
  workspaces: WorkspaceSummary[];
  currentWorkspaceId?: string;
}

export const WorkspaceSwitcher = ({
  workspaces,
  currentWorkspaceId,
}: WorkspaceSwitcherProps) => {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("");

  // Ensure a valid selected value
  useEffect(() => {
    if (currentWorkspaceId) {
      setSelected(currentWorkspaceId);
    } else if (workspaces.length > 0 && workspaces[0].id) {
      setSelected(workspaces[0].id);
    }
  }, [currentWorkspaceId, workspaces]);

  if (!workspaces.length) return null;

  const handleChange = (value: string) => {
    if (!value || value === "undefined") return;
    setSelected(value);
    router.push(`/protected/workspace/${value}`);
  };

  return (
    <Select value={selected} onValueChange={handleChange}>
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
