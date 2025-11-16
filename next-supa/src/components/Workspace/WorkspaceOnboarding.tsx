// src/components/Workspace/WorkspaceOnboarding.tsx
"use client";

import { useState } from "react";
import { Hash, Users, MessageSquare } from "lucide-react";
import { CreateWorkspaceForm } from "./CreateWorkspaceForm";
import { JoinWorkspaceForm } from "./JoinWorkspaceForm";

interface WorkspaceOnboardingProps {
  userId: string;
}

export function WorkspaceOnboarding({ userId }: WorkspaceOnboardingProps) {
  const [view, setView] = useState<"welcome" | "create" | "join">("welcome");

  if (view === "create") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4">
              <Hash className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Create your workspace</h1>
            <p className="text-muted-foreground">Give your workspace a name and description</p>
          </div>

          <CreateWorkspaceForm userId={userId} />

          <button
            onClick={() => setView("welcome")}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground mt-4"
          >
            ← Back to options
          </button>
        </div>
      </div>
    );
  }

  if (view === "join") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Join a workspace</h1>
            <p className="text-muted-foreground">Enter an invite code from your team</p>
          </div>

          <JoinWorkspaceForm userId={userId} />

          <button
            onClick={() => setView("welcome")}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground mt-4"
          >
            ← Back to options
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-6 shadow-lg">
            <MessageSquare className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to your workspace</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started by creating a new workspace for your team, or join an existing one with an
            invite code.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Workspace Card */}
          <button
            onClick={() => setView("create")}
            className="group bg-card border-2 border-border hover:border-primary rounded-xl p-8 text-left transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Hash className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Create a workspace</h2>
            <p className="text-muted-foreground mb-4">
              Start fresh with a new workspace for your team, project, or organization.
            </p>
            <div className="text-primary font-semibold flex items-center gap-2">
              Get started
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>

          {/* Join Workspace Card */}
          <button
            onClick={() => setView("join")}
            className="group bg-card border-2 border-border hover:border-primary rounded-xl p-8 text-left transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Join a workspace</h2>
            <p className="text-muted-foreground mb-4">
              Already have an invite? Join your team workspace with an invite code.
            </p>
            <div className="text-primary font-semibold flex items-center gap-2">
              Join now
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <a href="#" className="text-primary hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
