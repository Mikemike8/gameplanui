// src/lib/workspaces.ts
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  description?: string | null;
  is_personal?: boolean;
  role?: string;
}

export interface WorkspaceDetails {
  id: string;
  name: string;
  description?: string | null;
  is_personal?: boolean;
  owner_id: string;
}

/**
 * Get or create the backend user from Auth0 session.user
 */
export async function getOrCreateBackendUser(sessionUser: any): Promise<BackendUser> {
  const email: string = sessionUser.email || "";
  const name: string =
    sessionUser.name ||
    sessionUser.nickname ||
    email.split("@")[0] ||
    "User";

  const avatar: string =
    sessionUser.picture ||
    `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
      email || name
    )}`;

  const res = await fetch(`${API_URL}/users/me`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, avatar }),
  });

  if (!res.ok) {
    throw new Error("Failed to sync user with backend");
  }

  return (await res.json()) as BackendUser;
}

/**
 * Get all workspaces for a backend user
 */
export async function getMyWorkspaces(userId: string): Promise<WorkspaceSummary[]> {
  const res = await fetch(
    `${API_URL}/workspaces/my?user_id=${encodeURIComponent(userId)}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to load workspaces");
  }

  return (await res.json()) as WorkspaceSummary[];
}

/**
 * Get details of a single workspace
 */
export async function getWorkspace(workspaceId: string): Promise<WorkspaceDetails> {
  const res = await fetch(`${API_URL}/workspaces/${workspaceId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Workspace not found");
  }

  return (await res.json()) as WorkspaceDetails;
}

/**
 * Create a workspace (server-side)
 */
export async function createWorkspaceServer(
  userId: string,
  data: { name: string; description?: string; is_personal?: boolean }
): Promise<{ workspace_id: string }> {
  const res = await fetch(
    `${API_URL}/workspaces/create?user_id=${encodeURIComponent(userId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        description: data.description ?? "",
        is_personal: data.is_personal ?? false,
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to create workspace");
  }

  return (await res.json()) as { workspace_id: string };
}

/**
 * Join workspace using invite code (server-side)
 */
export async function joinWorkspaceServer(
  userId: string,
  inviteCode: string
): Promise<{ workspace_id: string }> {
  const res = await fetch(`${API_URL}/workspaces/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      invite_code: inviteCode,
      user_id: userId,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to join workspace");
  }

  return (await res.json()) as { workspace_id: string };
}
