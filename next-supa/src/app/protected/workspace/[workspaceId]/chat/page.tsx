// src/app/protected/workspace/[workspaceId]/chat/page.tsx
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { getOrCreateBackendUser, fetchMyWorkspaces, type Auth0User } from "@/lib/workspaces";
import TeamChannelInterface from "@/components/Dashboard/TeamChannelInterface";
import { buildAuthRoute } from "@/lib/auth-routes";

type AllowedView = "chat" | "files" | "calendar" | "team" | "events" | "notifications";

interface ChatPageProps {
  params: Promise<{ workspaceId: string }>;
  searchParams?: Promise<{ view?: string } | { view?: string }>;
}

export default async function ChatPage({ params, searchParams }: ChatPageProps) {
  const { workspaceId } = await params;
  const resolvedSearch = searchParams ? await searchParams : {};
  const desiredView = typeof resolvedSearch?.view === "string" ? resolvedSearch.view : undefined;
  const allowedViews: AllowedView[] = ["chat", "files", "calendar", "team", "events", "notifications"];
  const initialMainView = allowedViews.includes(desiredView as AllowedView)
    ? (desiredView as AllowedView)
    : undefined;

  const session = await auth0.getSession();

  if (!session?.user) {
    redirect(
      buildAuthRoute("login", { returnTo: `/protected/workspace/${workspaceId}/chat` })
    );
  }

  const backendUser = await getOrCreateBackendUser(session.user as Auth0User);
  const workspaces = await fetchMyWorkspaces(backendUser.id);

  // Verify user has access to this workspace
  const hasAccess = workspaces.some((w) => w.id === workspaceId);

  if (!hasAccess) {
    redirect("/protected/onboarding");
  }

  return (
    <TeamChannelInterface initialWorkspaceId={workspaceId} initialMainView={initialMainView} />
  );
}
