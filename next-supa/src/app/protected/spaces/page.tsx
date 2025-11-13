// src/app/protected/spaces/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SpacesPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-6">
      <h1 className="text-2xl font-semibold">Choose Your Workspace</h1>
      <p className="text-stone-600 max-w-md">
        Join a workspace you were invited to, or create your own space to begin collaborating.
      </p>

      <div className="flex gap-3">
        <Link href="/protected/create">
          <Button>Create Workspace</Button>
        </Link>

        <Link href="/protected/join/enter">
          <Button variant="outline">Join Workspace</Button>
        </Link>
      </div>
    </div>
  );
}
