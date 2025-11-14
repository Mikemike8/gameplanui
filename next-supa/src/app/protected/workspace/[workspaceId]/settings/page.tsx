// src/app/protected/workspace/[workspaceId]/settings/page.tsx
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { getWorkspace, fetchMyWorkspaces, getOrCreateBackendUser, type Auth0User } from "@/lib/workspaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface SettingsPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceSettingsPage({
  params,
}: SettingsPageProps) {
  const { workspaceId } = await params;

  if (!workspaceId) redirect("/protected/onboarding");

  const session = await auth0.getSession();
  if (!session?.user) {
    redirect(
      `/auth/login?returnTo=/protected/workspace/${workspaceId}/settings`
    );
  }

  const backendUser = await getOrCreateBackendUser(session.user as Auth0User);
  const workspaces = await fetchMyWorkspaces(backendUser.id);
  
  // Verify access
  const hasAccess = workspaces.some((w) => w.id === workspaceId);
  if (!hasAccess) {
    redirect("/protected/onboarding");
  }

  const workspace = await getWorkspace(workspaceId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href={`/protected/workspace/${workspaceId}/chat`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {workspace.name}
          </Link>
          <h1 className="text-2xl font-bold">Workspace Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Workspace Details */}
        <Card>
          <CardHeader>
            <CardTitle>Workspace Details</CardTitle>
            <CardDescription>
              Basic information about your workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ws-name">Workspace Name</Label>
              <Input
                id="ws-name"
                defaultValue={workspace.name}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ws-description">Description</Label>
              <Input
                id="ws-description"
                defaultValue={workspace.description || "No description"}
                disabled
                className="bg-muted"
              />
            </div>

            {workspace.is_personal && (
              <div className="text-sm text-muted-foreground p-3 bg-primary/5 rounded-lg">
                This is your personal workspace.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invite Code */}
        {workspace.invite_code && (
          <Card>
            <CardHeader>
              <CardTitle>Invite Members</CardTitle>
              <CardDescription>
                Share this code to invite people to your workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="invite-code">Invite Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="invite-code"
                    value={workspace.invite_code}
                    readOnly
                    className="font-mono bg-muted"
                  />
                  <Button
                    onClick={() => {
                      if (workspace.invite_code) {
                        navigator.clipboard.writeText(workspace.invite_code);
                      }
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions for this workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Leave this workspace and lose access to all channels and
                  messages.
                </p>
                <Button variant="destructive" size="sm" disabled>
                  Leave Workspace
                </Button>
              </div>

              {!workspace.is_personal && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    Permanently delete this workspace and all its data. This
                    cannot be undone.
                  </p>
                  <Button variant="destructive" size="sm" disabled>
                    Delete Workspace
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}