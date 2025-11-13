// src/app/protected/spaces/create/page.tsx
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { getOrCreateBackendUser } from "@/lib/workspaces";
import { CreateWorkspaceForm } from "@/components/Workspace/CreateWorkspaceForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CreateSpacePage() {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect("/auth/login?returnTo=/protected/spaces/create");
  }

  const backendUser = await getOrCreateBackendUser(session.user);

  return (
    <div className="space-y-6 max-w-xl">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-semibold">
          Create a new space
        </h1>
        <p className="text-sm text-stone-600">
          A space can be just for you or for a team. You can always change settings later.
        </p>
      </div>

      <CreateWorkspaceForm userId={backendUser.id} />

      <div className="text-xs text-stone-500 flex items-center gap-2">
        <span>Already have spaces?</span>
        <Link href="/protected/spaces">
          <Button variant="link" className="px-0 h-auto text-xs">
            Back to your spaces
          </Button>
        </Link>
      </div>
    </div>
  );
}
