// src/app/protected/workspace/[workspaceId]/page.tsx
import { redirect } from "next/navigation";

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;
  
  // Always redirect to chat - this is the main interface
  redirect(`/protected/workspace/${workspaceId}/chat`);
}