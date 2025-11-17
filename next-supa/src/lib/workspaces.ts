// src/lib/workspaces.ts

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://ggameplan-backend.onrender.com";

/* ----------------------------- Types ----------------------------- */

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
  role: string;
  is_personal: boolean;
}

export interface WorkspaceDetail {
  id: string;
  name: string;
  description?: string | null;
  owner_id: string;
  is_personal: boolean;
  invite_code?: string | null;
}

export interface Auth0User {
  email?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  [key: string]: unknown;
}

export interface CreateWorkspaceBody {
  name: string;
  description?: string;
  is_personal?: boolean;
}

export interface CreateWorkspaceResponse {
  workspace_id: string;
  invite_code?: string;
}

export interface JoinWorkspaceResponse {
  workspace_id: string;
  role: string;
}

export interface DeleteWorkspaceResponse {
  success: boolean;
}

/* ------------------------- API FUNCTIONS ------------------------- */

export async function getOrCreateBackendUser(auth0User: Auth0User): Promise<BackendUser> {
  if (!auth0User.email) {
    throw new Error("Auth0 user is missing email");
  }

  const res = await fetch(`${API_URL}/users/me`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      name: auth0User.name || auth0User.nickname || auth0User.email,
      email: auth0User.email,
      avatar: auth0User.picture,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to sync user with backend");
  }

  return res.json() as Promise<BackendUser>;
}

export async function fetchMyWorkspaces(userId: string): Promise<WorkspaceSummary[]> {
  const res = await fetch(`${API_URL}/workspaces/my?user_id=${encodeURIComponent(userId)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load workspaces");
  }

  const data = (await res.json()) as Array<
    Omit<WorkspaceSummary, "id"> & { id: string | number | undefined }
  >;

  return data.map((workspace) => ({
    ...workspace,
    id: String(workspace.id ?? ""),
  }));
}

export async function joinWorkspaceServer(userId: string, inviteCode: string) {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://ggameplan-backend.onrender.com";

  const res = await fetch(`${API_URL}/workspaces/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      invite_code: inviteCode,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Failed to join workspace");
  }

  return res.json(); // → { workspace_id }
}

export async function getWorkspace(workspaceId: string): Promise<WorkspaceDetail> {
  if (!workspaceId || workspaceId === "undefined") {
    throw new Error("Invalid workspace ID");
  }

  const res = await fetch(`${API_URL}/workspaces/${workspaceId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Workspace not found");
  }

  return res.json() as Promise<WorkspaceDetail>;
}

export async function createWorkspace(
  userId: string,
  body: CreateWorkspaceBody
): Promise<CreateWorkspaceResponse> {
  const params = new URLSearchParams({ user_id: userId });

  const res = await fetch(`${API_URL}/workspaces/create?${params.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Failed to create workspace");
  }

  return res.json() as Promise<CreateWorkspaceResponse>;
}

export async function deleteWorkspace(workspaceId: string, userId: string) {
  const params = new URLSearchParams({ user_id: userId });
  const res = await fetch(`${API_URL}/workspaces/${workspaceId}?${params.toString()}`, {
    method: "DELETE",
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.detail || "Failed to delete workspace");
  }

  return res.json() as Promise<DeleteWorkspaceResponse>;
}
