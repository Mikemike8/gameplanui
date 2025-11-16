// src/app/protected/workspace/[workspaceId]/chat/page.tsx
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { getOrCreateBackendUser, fetchMyWorkspaces, type Auth0User } from "@/lib/workspaces";
import TeamChannelInterface from "@/components/Dashboard/TeamChannelInterface";

interface ChatPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { workspaceId } = await params;

  const session = await auth0.getSession();

  if (!session?.user) {
    redirect(`/auth/login?returnTo=/protected/workspace/${workspaceId}/chat`);
  }

  const backendUser = await getOrCreateBackendUser(session.user as Auth0User);
  const workspaces = await fetchMyWorkspaces(backendUser.id);

  // Verify user has access to this workspace
  const hasAccess = workspaces.some((w) => w.id === workspaceId);

  if (!hasAccess) {
    redirect("/protected/onboarding");
  }

  return <TeamChannelInterface initialWorkspaceId={workspaceId} />;
}
