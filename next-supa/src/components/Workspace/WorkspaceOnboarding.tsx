// src/components/Workspace/WorkspaceOnboarding.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Hash,
  Users,
  MessageSquare,
  ArrowRight,
  Loader2,
  Monitor,
  Sparkles,
} from "lucide-react";
import { CreateWorkspaceForm } from "./CreateWorkspaceForm";
import { JoinWorkspaceForm } from "./JoinWorkspaceForm";
import { fetchMyWorkspaces, type WorkspaceSummary } from "@/lib/workspaces";

interface WorkspaceOnboardingProps {
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
}

export function WorkspaceOnboarding({ userId, userEmail, userName }: WorkspaceOnboardingProps) {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<"create" | "join" | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadWorkspaces() {
      try {
        setLoadingWorkspaces(true);
        setWorkspaceError(null);
        const data = await fetchMyWorkspaces(userId);
        if (isMounted) {
          setWorkspaces(data);
        }
      } catch (error) {
        if (isMounted) {
          setWorkspaceError("We couldn’t load your workspaces. Try refreshing.");
        }
      } finally {
        if (isMounted) {
          setLoadingWorkspaces(false);
        }
      }
    }

    loadWorkspaces();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const refreshWorkspaces = () => {
    setLoadingWorkspaces(true);
    setWorkspaceError(null);
    fetchMyWorkspaces(userId)
      .then((data) => setWorkspaces(data))
      .catch(() => setWorkspaceError("Still having trouble loading workspaces."))
      .finally(() => setLoadingWorkspaces(false));
  };

  const greetingName = useMemo(() => {
    if (!userName) return "there";
    return userName.split(" ")[0] || "there";
  }, [userName]);

  const emailLabel = userEmail || "your account";

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#2F145C] via-[#1A1039] to-[#0F0B1F] text-white">
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_60%)]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(135deg,_rgba(255,255,255,0.12)_0%,_transparent_45%,_rgba(255,255,255,0.08)_100%)]" />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-primary font-black text-2xl">#</span>
              </div>
              <div>
                <p className="text-lg font-semibold leading-none">GamePlan</p>
                <p className="text-xs text-white/60 tracking-[0.2em] uppercase">Team OS</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-white/70 text-sm">
              <button className="hover:text-white transition">Workspaces</button>
              <button className="hover:text-white transition">Events</button>
              <button className="hover:text-white transition">Files</button>
              <button className="hover:text-white transition">Support</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-full border border-white/30 text-sm font-semibold hover:border-white hover:bg-white/10 transition">
              Need help?
            </button>
            <button
              onClick={() => setActivePanel("create")}
              className="px-5 py-2 rounded-full bg-white text-primary font-semibold text-sm hover:bg-purple-50 transition"
            >
              New workspace
            </button>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          {/* Welcome */}
          <div className="mb-12">
            <p className="text-sm uppercase tracking-[0.25em] text-white/60 mb-3">
              Welcome back
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 flex items-center gap-3">
              <span className="text-5xl">👋</span>
              Hey {greetingName}, let’s get your team set up.
            </h1>
            <p className="text-lg text-white/80 max-w-3xl">
              Create a new workspace for a fresh project or jump back into an existing crew. Invite
              teammates, plan events, and keep every conversation in one place.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Workspaces card */}
            <section className="lg:col-span-2 bg-white/95 text-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Workspaces for {emailLabel}</p>
                  <h2 className="text-2xl font-bold mt-1">Pick up where you left off</h2>
                </div>
                <button
                  onClick={refreshWorkspaces}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 hover:text-purple-900"
                >
                  Refresh
                  {loadingWorkspaces ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {loadingWorkspaces && (
                  <>
                    {[0, 1].map((item) => (
                      <div
                        key={item}
                        className="w-full h-24 rounded-2xl bg-gray-100 animate-pulse"
                      />
                    ))}
                  </>
                )}

                {!loadingWorkspaces && workspaceError && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
                    <p className="font-semibold mb-1">Can’t load workspaces</p>
                    <p className="text-sm">{workspaceError}</p>
                  </div>
                )}

                {!loadingWorkspaces && !workspaceError && workspaces.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-gray-300 p-8 bg-gray-50/70 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">No workspaces yet</p>
                      <p className="text-sm text-gray-600">
                        Create your first workspace and invite your teammates.
                      </p>
                    </div>
                    <button
                      onClick={() => setActivePanel("create")}
                      className="px-5 py-3 rounded-xl bg-purple-700 text-white font-semibold shadow-lg hover:bg-purple-800 transition"
                    >
                      Create workspace
                    </button>
                  </div>
                )}

                {!loadingWorkspaces &&
                  !workspaceError &&
                  workspaces.map((workspace) => (
                    <div
                      key={workspace.id}
                      className="flex flex-col md:flex-row md:items-center gap-4 justify-between border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition bg-white"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-2xl font-bold flex items-center justify-center shadow-lg">
                          {workspace.name?.charAt(0)?.toUpperCase() || "G"}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{workspace.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {workspace.description || "Collaborate, chat, and align your team goals."}
                          </p>
                          <p className="text-xs uppercase tracking-wide text-gray-400 mt-1">
                            {workspace.role ? `${workspace.role} · Workspace` : "Workspace"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/protected/workspace/${workspace.id}`)}
                        className="px-6 py-3 rounded-xl bg-purple-700 text-white font-semibold hover:bg-purple-800 transition shadow-md"
                      >
                        Launch workspace
                      </button>
                    </div>
                  ))}
              </div>
            </section>

            {/* Actions / forms */}
            <section className="space-y-6">
              <div className="bg-white/10 border border-white/20 rounded-3xl p-6 sm:p-7 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 uppercase tracking-[0.25em]">Get started</p>
                    <h3 className="text-2xl font-bold mt-2">Create or join</h3>
                  </div>
                  {activePanel && (
                    <button
                      onClick={() => setActivePanel(null)}
                      className="text-sm text-white/70 hover:text-white transition"
                    >
                      ← Back
                    </button>
                  )}
                </div>

                {!activePanel && (
                  <div className="mt-8 space-y-4">
                    <button
                      onClick={() => setActivePanel("create")}
                      className="w-full bg-white text-purple-800 rounded-2xl p-5 text-left flex items-center justify-between shadow-lg hover:-translate-y-1 transition"
                    >
                      <div>
                        <p className="text-lg font-semibold">Create workspace</p>
                        <p className="text-sm text-purple-700">
                          Spin up a space for a new team or project.
                        </p>
                      </div>
                      <Hash className="w-8 h-8 text-purple-600" />
                    </button>
                    <button
                      onClick={() => setActivePanel("join")}
                      className="w-full bg-transparent border border-white/30 rounded-2xl p-5 text-left flex items-center justify-between hover:bg-white/5 transition"
                    >
                      <div>
                        <p className="text-lg font-semibold">Join with invite</p>
                        <p className="text-sm text-white/80">Already have a code? Jump right in.</p>
                      </div>
                      <Users className="w-8 h-8 text-white/80" />
                    </button>
                  </div>
                )}

                {activePanel === "create" && (
                  <div className="mt-6 rounded-2xl bg-white text-gray-900 p-5 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">Create a workspace</p>
                        <p className="text-sm text-gray-500">Name it, describe it, invite the team.</p>
                      </div>
                    </div>
                    <CreateWorkspaceForm
                      userId={userId}
                      className="bg-transparent border border-gray-200 shadow-none p-0 pt-4"
                    />
                  </div>
                )}

                {activePanel === "join" && (
                  <div className="mt-6 rounded-2xl bg-white text-gray-900 p-5 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">Join a workspace</p>
                        <p className="text-sm text-gray-500">
                          Paste your invite code to join instantly.
                        </p>
                      </div>
                    </div>
                    <JoinWorkspaceForm
                      userId={userId}
                      className="bg-transparent border border-gray-200 shadow-none p-0 pt-4"
                    />
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-gradient-to-r from-orange-100/90 to-rose-100/80 text-gray-900 p-6 shadow-xl flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">👩‍💻</div>
                  <div>
                    <h4 className="text-lg font-semibold">Working with another crew?</h4>
                    <p className="text-sm text-gray-600">
                      Spin up a separate workspace to keep things organized.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActivePanel("create")}
                  className="self-start px-5 py-2 rounded-xl bg-white text-purple-700 font-semibold border border-purple-100 hover:bg-purple-50 transition"
                >
                  Create another workspace
                </button>
              </div>
            </section>
          </div>

          {/* Footer banner */}
          <div className="mt-10 bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <Monitor className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold">GamePlan Desktop</p>
                <p className="text-sm text-white/70">
                  Keep chats, events, and files docked on your desktop with instant alerts.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold">
              <button className="text-purple-200 hover:text-white transition">Download for Mac</button>
              <span className="text-white/30">•</span>
              <button className="text-purple-200 hover:text-white transition">Dismiss ×</button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-white/70">
            Not seeing your workspace?{" "}
            <button className="underline underline-offset-4 hover:text-white">
              Try signing in with a different email →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
