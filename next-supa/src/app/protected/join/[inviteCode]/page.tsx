// src/app/protected/spaces/join/[inviteCode]/page.tsx
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { getOrCreateBackendUser, joinWorkspaceServer } from "@/lib/workspaces";

interface JoinByInvitePageProps {
  params: { inviteCode: string };
}

export default async function JoinByInvitePage({ params }: JoinByInvitePageProps) {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect(`/auth/login?returnTo=/protected/spaces/join/${params.inviteCode}`);
  }

  const backendUser = await getOrCreateBackendUser(session.user);

  try {
    const { workspace_id } = await joinWorkspaceServer(backendUser.id, params.inviteCode);

    redirect(`/protected/workspace/${workspace_id}`);
  } catch {
    // Fall back to spaces page with error message in query (optional)
    redirect("/protected/spaces?joinError=1");
  }
}
