// src/components/Workspace/WorkspaceList.tsx
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { WorkspaceSummary } from "@/lib/workspaces";

interface WorkspaceListProps {
  workspaces: WorkspaceSummary[];
}

export const WorkspaceList = ({ workspaces }: WorkspaceListProps) => {
  if (!workspaces.length) {
    return (
      <div className="border border-dashed rounded-md p-4 text-sm text-stone-600 bg-white">
        You don’t have any spaces yet. Create your first one to get started.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {workspaces.map((ws) => (
        <Card key={ws.id} className="hover:shadow-sm transition-shadow">
          <Link href={`/protected/workspace/${ws.id}`}>
            <CardHeader className="cursor-pointer">
              <CardTitle className="flex items-center gap-2 text-base">
                <span>{ws.name}</span>
                {ws.is_personal && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    Personal
                  </span>
                )}
              </CardTitle>
              {ws.description && (
                <CardDescription className="line-clamp-2 text-xs">
                  {ws.description}
                </CardDescription>
              )}
              {ws.role && (
                <p className="mt-1 text-[11px] uppercase tracking-wide text-stone-500">
                  Role: {ws.role}
                </p>
              )}
            </CardHeader>
          </Link>
        </Card>
      ))}
    </div>
  );
};
