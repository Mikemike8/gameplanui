// src/components/Dashboard/TeamChannelInterface.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Hash,
  Smile,
  Paperclip,
  Plus,
  Search,
  Users,
  Pin,
  PinOff,
  Settings,
  ChevronDown,
  LogOut,
  Building2,
  FileText,
  CalendarDays,
  MessageSquare,
  Trash2,
  Video,
  X,
  Loader2,
  CalendarClock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { v4 as uuidv4 } from "uuid";
import { io, Socket } from "socket.io-client";
import { useUser as useAuth0 } from "@auth0/nextjs-auth0/client";
import { FilePanel } from "@/components/Workspace/FilePanel";
import { CalendarPanel } from "@/components/Workspace/CalendarPanel";
import { TeamSnapshotPanel } from "@/components/Workspace/TeamSnapshotPanel";
import { TeamEventsPanel } from "@/components/Events/TeamEventsPanel";
import { cn } from "@/lib/utils";
import { deleteWorkspace as deleteWorkspaceApi } from "@/lib/workspaces";
import { CopyInviteButton } from "@/components/Workspace/CopyInviteButton";

/* Types */
interface ApiUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface ApiMessage {
  id: string;
  content: string;
  timestamp: string;
  user: ApiUser | null;
  reactions: { emoji: string; count: number; users: string[] }[];
  isPinned: boolean;
  pinnedBy?: string;
}

interface ApiChannel {
  id: string;
  name: string;
  description?: string;
  is_private: boolean;
}

interface SwitcherWorkspace {
  id: string;
  name: string;
  role: string;
  is_personal: boolean;
  invite_code?: string | null;
}

interface User extends ApiUser {
  status: "online" | "away" | "offline";
}

interface Message {
  id: string;
  content: string;
  user: User;
  timestamp: Date;
  reactions: { emoji: string; count: number; users: string[] }[];
  isPinned: boolean;
  pinnedBy?: string;
  attachment?: FileAttachment;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  unreadCount: number;
  isPrivate: boolean;
}

interface TeamChannelInterfaceProps {
  initialWorkspaceId?: string;
}

interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  mime_type?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ggameplan-backend.onrender.com";
const FILE_SHARE_PREFIX = "FILE_SHARE::";

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const resolveAttachmentUrl = (url: string) => {
  if (!url) return "#";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
};

const parseMessageContent = (raw: string): { text: string; attachment?: FileAttachment } => {
  if (raw?.startsWith(FILE_SHARE_PREFIX)) {
    try {
      const payload = JSON.parse(raw.slice(FILE_SHARE_PREFIX.length));
      const attachment = payload.attachment as FileAttachment | undefined;
      const textFromPayload = typeof payload.text === "string" ? payload.text : "";
      return {
        text: textFromPayload || (attachment ? `Shared ${attachment.name}` : "Shared a document"),
        attachment,
      };
    } catch (error) {
      console.error("Failed to parse attachment payload", error);
      return { text: "Shared a document" };
    }
  }

  return { text: raw };
};

const mapApiMessage = (m: ApiMessage): Message => {
  const { text, attachment } = parseMessageContent(m.content);
  const user = m.user
    ? { ...m.user, status: "online" as const }
    : {
        id: "unknown",
        name: "Unknown",
        email: "",
        avatar: "",
        status: "offline" as const,
      };

  return {
    id: m.id,
    content: text,
    attachment,
    user,
    timestamp: new Date(m.timestamp),
    reactions: m.reactions || [],
    isPinned: m.isPinned,
    pinnedBy: m.pinnedBy,
  };
};

const encodeAttachmentPayload = (text: string, attachment: FileAttachment) => {
  return `${FILE_SHARE_PREFIX}${JSON.stringify({
    text,
    attachment,
  })}`;
};

const buildDisplayText = (text: string, attachment?: FileAttachment) => {
  if (attachment) {
    return text || `Shared ${attachment.name}`;
  }
  return text;
};

export default function TeamChannelInterface({ initialWorkspaceId }: TeamChannelInterfaceProps) {
  const { user: auth0User, isLoading: auth0Loading } = useAuth0();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [allWorkspaces, setAllWorkspaces] = useState<SwitcherWorkspace[]>([]);

  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentMessage, setCurrentMessage] = useState("");

  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDescription, setNewChannelDescription] = useState("");
  const [isPrivateChannel, setIsPrivateChannel] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [showWorkspaceSwitcher, setShowWorkspaceSwitcher] = useState(false);
  const [mainView, setMainView] = useState<"chat" | "files" | "calendar" | "team" | "events">(
    "chat"
  );
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const [deletingWorkspaceId, setDeletingWorkspaceId] = useState<string | null>(null);
  const [pendingAttachment, setPendingAttachment] = useState<FileAttachment | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteWorkspace, setInviteWorkspace] = useState<SwitcherWorkspace | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const emojis = ["👍", "❤️", "😂", "🎉", "🚀", "👀", "🔥", "💯"];
  const pinnedMessages = messages.filter((m) => m.isPinned);
  const toggleMainView = (view: "files" | "calendar" | "team" | "events") => {
    setMainView((current) => (current === view ? "chat" : view));
    setShowPinnedMessages(false);
  };
  const mainAreaButtonClass = (isActive: boolean) =>
    cn(
      "p-2 rounded transition-colors",
      isActive ? "bg-primary/10 text-primary" : "hover:bg-accent"
    );

  const workspaceButtonClass = (isActive: boolean) =>
    cn(
      "w-full flex items-center gap-2 rounded-lg border px-2 py-2 text-sm transition-colors",
      isActive
        ? "bg-primary/15 border-primary/40 text-foreground shadow-sm"
        : "bg-card border-border/70 hover:bg-muted"
    );

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  /* Load Current User */
  const loadCurrentUser = useCallback(async () => {
    if (!auth0User) return;

    const name = auth0User.name || auth0User.nickname || auth0User.email!;
    const email = auth0User.email!;
    const avatar = auth0User.picture || "";

    const res = await fetch(`${API_URL}/users/me`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, avatar }),
    });

    const apiUser: ApiUser = await res.json();
    setCurrentUser({ ...apiUser, status: "online" });
  }, [auth0User]);

  /* Load Workspaces */
  useEffect(() => {
    if (!currentUser) return;

    const loadWorkspaces = async () => {
      const res = await fetch(`${API_URL}/workspaces/my?user_id=${currentUser.id}`, {
        cache: "no-store",
      });

      const workspaces: SwitcherWorkspace[] = await res.json();
      setAllWorkspaces(workspaces);

      if (initialWorkspaceId) {
        setWorkspaceId(initialWorkspaceId);
        const ws = workspaces.find((w) => w.id === initialWorkspaceId);
        setWorkspaceName(ws?.name || "Workspace");
      } else if (workspaces.length > 0) {
        const personal = workspaces.find((w) => w.is_personal) || workspaces[0];
        setWorkspaceId(personal.id);
        setWorkspaceName(personal.name);
      }
    };

    loadWorkspaces();
  }, [currentUser, initialWorkspaceId]);

  /* Create Default Channel */
  const createDefaultChannel = useCallback(
    async (wsId: string) => {
      if (!currentUser) return;

      const res = await fetch(`${API_URL}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: wsId,
          name: "general",
          description: "General workspace chat",
          is_private: false,
        }),
      });

      const ch: ApiChannel = await res.json();

      const newCh: Channel = {
        id: ch.id,
        name: ch.name,
        description: ch.description ?? "",
        memberCount: 0,
        unreadCount: 0,
        isPrivate: ch.is_private,
      };

      setChannels([newCh]);
      setCurrentChannel(newCh);
    },
    [currentUser]
  );

  /* Load Channels */
  const loadChannels = useCallback(async () => {
    if (!workspaceId) return;

    const res = await fetch(`${API_URL}/channels?workspace_id=${workspaceId}`, {
      cache: "no-store",
    });

    const data: ApiChannel[] = await res.json();

    if (!Array.isArray(data)) return;

    if (data.length === 0) {
      await createDefaultChannel(workspaceId);
      return;
    }

    const mapped = data.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description ?? "",
      memberCount: 0,
      unreadCount: 0,
      isPrivate: c.is_private,
    })) as Channel[];

    setChannels(mapped);
    if (!currentChannel) {
      setCurrentChannel(mapped[0]);
    }
  }, [workspaceId, currentChannel, createDefaultChannel]);

  /* Load Messages */
  const loadMessages = useCallback(async () => {
    if (!currentChannel) return;

    const res = await fetch(`${API_URL}/messages?channel_id=${currentChannel.id}`, {
      cache: "no-store",
    });

    const data: ApiMessage[] = await res.json();

    setMessages(data.map((m) => mapApiMessage(m)));
  }, [currentChannel]);

  /* WebSockets */
  useEffect(() => {
    const socket = io(API_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("new-message", (msg: ApiMessage) => {
      const parsed = mapApiMessage(msg);
      setMessages((prev) => {
        if (prev.some((m) => m.id === parsed.id)) return prev;
        return [...prev, parsed];
      });
    });

    socket.on(
      "message-pinned",
      (data: { message_id: string; is_pinned: boolean; pinned_by?: string }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.message_id
              ? { ...m, isPinned: data.is_pinned, pinnedBy: data.pinned_by }
              : m
          )
        );
      }
    );

    socket.on("reaction-added", () => {
      loadMessages();
    });

    return () => {
      socket.disconnect();
    };
  }, [loadMessages]);

  /* Send Message */
  const handleSendMessage = async () => {
    if (!currentUser || !currentChannel) return;
    const trimmed = currentMessage.trim();
    if (!trimmed && !pendingAttachment) return;

    const attachment = pendingAttachment ? { ...pendingAttachment } : undefined;
    const displayText = buildDisplayText(trimmed, attachment);
    const rawContent = attachment ? encodeAttachmentPayload(trimmed, attachment) : trimmed;

    if (!rawContent) return;

    const tempId = uuidv4();
    const optimistic: Message = {
      id: tempId,
      content: displayText,
      user: currentUser,
      timestamp: new Date(),
      reactions: [],
      isPinned: false,
      attachment,
    };

    setMessages((prev) => [...prev, optimistic]);
    setCurrentMessage("");
    setPendingAttachment(null);
    setUploadError(null);

    const res = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: rawContent,
        channel_id: currentChannel.id,
        user_id: currentUser.id,
      }),
    });

    if (!res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      return;
    }

    const saved = mapApiMessage(await res.json());

    setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /* Reactions */
  const addReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return;

    await fetch(`${API_URL}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message_id: messageId,
        user_id: currentUser.id,
        emoji,
      }),
    });

    setShowEmojiPicker(null);
  };

  /* Pin Message */
  const togglePinMessage = async (messageId: string) => {
    if (!currentUser) return;

    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    const newState = !msg.isPinned;

    await fetch(`${API_URL}/messages/${messageId}/pin`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        is_pinned: newState,
        user_id: currentUser.id,
      }),
    });

    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              isPinned: newState,
              pinnedBy: newState ? currentUser.id : undefined,
            }
          : m
      )
    );
  };

  /* Create Channel */
  const handleCreateChannel = async () => {
    if (!workspaceId || !newChannelName.trim()) return;

    const res = await fetch(`${API_URL}/channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspace_id: workspaceId,
        name: newChannelName.toLowerCase().replace(/\s+/g, "-"),
        description: newChannelDescription,
        is_private: isPrivateChannel,
      }),
    });

    if (!res.ok) return;

    const ch: ApiChannel = await res.json();

    const newCh: Channel = {
      id: ch.id,
      name: ch.name,
      description: ch.description ?? "",
      memberCount: 0,
      unreadCount: 0,
      isPrivate: ch.is_private,
    };

    setChannels((prev) => [...prev, newCh]);
    setCurrentChannel(newCh);
    setIsCreateChannelOpen(false);
    setNewChannelName("");
    setNewChannelDescription("");
    setIsPrivateChannel(false);
  };

  /* Data Load Chain */
  useEffect(() => {
    if (!auth0Loading && auth0User) loadCurrentUser();
  }, [auth0User, auth0Loading, loadCurrentUser]);

  useEffect(() => {
    if (workspaceId) loadChannels();
  }, [workspaceId, loadChannels]);

  useEffect(() => {
    if (currentChannel) loadMessages();
  }, [currentChannel, loadMessages]);

  useEffect(() => {
    setMainView("chat");
    setShowPinnedMessages(false);
  }, [currentChannel?.id]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    setCurrentUser((prev) =>
      prev ? { ...prev, status: isOnline ? "online" : "offline" } : prev
    );
  }, [isOnline]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDeleteWorkspace = async (workspace: SwitcherWorkspace) => {
    if (!currentUser || workspace.is_personal || workspace.role !== "owner") return;
    const confirmed = window.confirm(
      `Delete workspace "${workspace.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingWorkspaceId(workspace.id);
    try {
      await deleteWorkspaceApi(workspace.id, currentUser.id);
      const updatedWorkspaces = allWorkspaces.filter((w) => w.id !== workspace.id);
      setAllWorkspaces(updatedWorkspaces);
      setShowWorkspaceSwitcher(false);

      if (workspace.id === workspaceId) {
        if (updatedWorkspaces.length > 0) {
          const nextWorkspace = updatedWorkspaces[0];
          router.push(`/protected/workspace/${nextWorkspace.id}/chat`);
        } else {
          router.push("/protected/onboarding");
        }
      }
    } catch (error) {
      console.error("Failed to delete workspace", error);
      alert("Failed to delete workspace. Please try again.");
    } finally {
      setDeletingWorkspaceId(null);
    }
  };

  const handleDocumentSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) return;

    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadingDoc(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", currentUser.id);

      const res = await fetch(`${API_URL}/files/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.detail || "Failed to upload document");
      }

      const data = await res.json();
      setPendingAttachment({
        id: data.id,
        name: data.name,
        url: data.url,
        size: data.size,
        mime_type: data.mime_type,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploadError(message);
    } finally {
      setUploadingDoc(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "https://gameplanuipro.onrender.com";

  const inviteLink = inviteWorkspace?.invite_code
    ? `${siteUrl}/protected/join/${inviteWorkspace.invite_code}`
    : "";

  const handleGenerateInviteCode = () => {
    if (!inviteWorkspace) return;
    const newCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    setInviteWorkspace({ ...inviteWorkspace, invite_code: newCode });
    setAllWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === inviteWorkspace.id ? { ...workspace, invite_code: newCode } : workspace
      )
    );
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const term = searchQuery.toLowerCase();
    return messages
      .filter(
        (message) =>
          message.content?.toLowerCase().includes(term) ||
          message.user.name.toLowerCase().includes(term)
      )
      .slice(0, 20);
  }, [messages, searchQuery]);
  /* Loading Screen */
  if (auth0Loading || !auth0User || !currentUser || !workspaceId || !currentChannel) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } slack-sidebar transition-all duration-200 flex flex-col border-r border-sidebar-border`}
      >
        {/* Workspace Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-sidebar-border shrink-0">
          <button
            onClick={() => setShowWorkspaceSwitcher(!showWorkspaceSwitcher)}
            className="flex items-center gap-2 hover:bg-sidebar-accent rounded px-2 py-1 flex-1 min-w-0"
          >
            <span className="font-bold truncate">{workspaceName}</span>
            <ChevronDown className="w-4 h-4 shrink-0" />
          </button>
        </div>

        {/* Workspace Switcher Dropdown */}
        {showWorkspaceSwitcher && (
          <div className="absolute top-14 left-0 w-64 bg-card border border-border shadow-lg rounded-b-lg z-50 max-h-80 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-semibold text-muted-foreground px-2 py-1">
                YOUR WORKSPACES
              </div>
              {allWorkspaces.map((ws) => {
                const isActive = ws.id === workspaceId;
                const canDelete = ws.role === "owner" && !ws.is_personal;
                return (
                  <div key={ws.id} className={workspaceButtonClass(isActive)}>
                    <button
                      type="button"
                      onClick={() => {
                        router.push(`/protected/workspace/${ws.id}/chat`);
                        setShowWorkspaceSwitcher(false);
                      }}
                      className="flex-1 flex items-center gap-2 text-left text-foreground"
                    >
                      <Building2
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span className="truncate font-medium">{ws.name}</span>
                      {ws.is_personal && (
                        <span
                          className={cn(
                            "text-xs",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          (You)
                        </span>
                      )}
                    </button>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorkspace(ws);
                        }}
                        className={cn(
                          "p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive",
                          deletingWorkspaceId === ws.id && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={deletingWorkspaceId === ws.id}
                        aria-label={`Delete workspace ${ws.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
              <div className="border-t border-border my-2" />
              <button
                type="button"
                onClick={() => {
                  const active = allWorkspaces.find((ws) => ws.id === workspaceId);
                  if (active) {
                    setInviteWorkspace(active);
                    setInviteModalOpen(true);
                    setShowWorkspaceSwitcher(false);
                  }
                }}
                className={cn(workspaceButtonClass(false), "text-primary font-medium")}
              >
                <Plus className="w-4 h-4" />
                Invite Teammates
              </button>
            </div>
          </div>
        )}

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <span className="text-sm font-semibold">Channels</span>
            <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
              <DialogTrigger asChild>
                <button className="p-1 hover:bg-sidebar-accent rounded">
                  <Plus className="w-4 h-4" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a channel</DialogTitle>
                  <DialogDescription>Channels are where your team communicates.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="channel-name">Name</Label>
                    <Input
                      id="channel-name"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      placeholder="e.g. project-planning"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="channel-description">Description (optional)</Label>
                    <Input
                      id="channel-description"
                      value={newChannelDescription}
                      onChange={(e) => setNewChannelDescription(e.target.value)}
                      placeholder="What's this channel about?"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="private"
                      checked={isPrivateChannel}
                      onCheckedChange={(v) => setIsPrivateChannel(!!v)}
                    />
                    <Label htmlFor="private">Make private</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateChannelOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateChannel}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-0.5">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setCurrentChannel(channel)}
                className={`w-full flex items-center px-2 py-1 rounded slack-channel-item text-sm ${
                  currentChannel.id === channel.id ? "slack-channel-active" : ""
                }`}
              >
                <Hash className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate">{channel.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="h-12 px-2 flex items-center border-t border-sidebar-border shrink-0 gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{currentUser.name}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isOnline ? "bg-green-500" : "bg-gray-400"
                  )}
                />
                <span>{isOnline ? "Active" : "Offline"}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              window.location.href = "/auth/logout";
            }}
            className="p-2 hover:bg-sidebar-accent rounded text-muted-foreground hover:text-destructive"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center px-4 bg-card shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-2 p-2 hover:bg-accent rounded lg:hidden"
          >
            <Hash className="w-5 h-5" />
          </button>

          <div className="flex items-center flex-1 min-w-0">
            <Hash className="w-5 h-5 text-muted-foreground mr-2 shrink-0" />
            <div className="flex flex-col min-w-0">
              <div className="font-bold truncate">{currentChannel.name}</div>
              {currentChannel.description && (
                <div className="text-xs text-muted-foreground truncate">
                  {currentChannel.description}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMainView("chat")}
              className={mainAreaButtonClass(mainView === "chat")}
              aria-pressed={mainView === "chat"}
              title="Messages"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowPinnedMessages(!showPinnedMessages)}
              className="relative p-2 hover:bg-accent rounded"
            >
              <Pin className="w-5 h-5" />
              {pinnedMessages.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {pinnedMessages.length}
                </Badge>
              )}
            </button>

            <button
              onClick={() => toggleMainView("files")}
              className={cn(mainAreaButtonClass(mainView === "files"), "hidden sm:block")}
              aria-pressed={mainView === "files"}
              title="Files"
            >
              <FileText className="w-5 h-5" />
            </button>

            {/* <button
              onClick={() => toggleMainView("calendar")}
              className={cn(mainAreaButtonClass(mainView === "calendar"), "hidden sm:block")}
              aria-pressed={mainView === "calendar"}
              title="Calendar"
            >
              <CalendarDays className="w-5 h-5" />
            </button> */}
            <button
              onClick={() => toggleMainView("events")}
              className={cn(mainAreaButtonClass(mainView === "events"), "hidden sm:block")}
              aria-pressed={mainView === "events"}
              title="Team events"
            >
              <CalendarClock className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowVideoModal(true)}
              className="p-2 hover:bg-accent rounded hidden sm:block"
              title="Start video call"
            >
              <Video className="w-5 h-5" />
            </button>


            <button
              onClick={() => setShowSearchModal(true)}
              className="p-2 hover:bg-accent rounded hidden sm:block"
              title="Search messages"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => toggleMainView("team")}
              className={cn(mainAreaButtonClass(mainView === "team"), "hidden sm:block")}
              aria-pressed={mainView === "team"}
              title="Team snapshot"
            >
              <Users className="w-5 h-5" />
            </button>

            <button
              onClick={() => router.push(`/protected/workspace/${workspaceId}/settings`)}
              className="p-2 hover:bg-accent rounded"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {mainView === "chat" ? (
          <>
            {showPinnedMessages && pinnedMessages.length > 0 && (
              <div className="bg-primary/5 border-b border-border p-3 text-sm space-y-2">
                <div className="font-semibold flex items-center gap-2">
                  <Pin className="w-4 h-4" />
                  Pinned Messages
                </div>
                {pinnedMessages.map((m) => (
                  <div key={m.id} className="pl-6">
                    <strong>{m.user.name}:</strong> {m.content}
                  </div>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3 group relative">
                  <img
                    src={message.user.avatar}
                    alt={message.user.name}
                    className="w-10 h-10 rounded shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold">{message.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.isPinned && (
                        <span className="text-xs text-primary flex items-center gap-1">
                          <Pin className="w-3 h-3" />
                          Pinned
                        </span>
                      )}
                    </div>

                    {message.content && (
                      <div className="mt-1 whitespace-pre-wrap break-words">{message.content}</div>
                    )}

                    {message.attachment && (
                      <div className="mt-3 border border-border rounded-lg bg-muted/40 p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-primary shrink-0" />
                          <div>
                            <div className="font-medium">{message.attachment.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {(message.attachment.mime_type || "Document").split("/").pop()} •{" "}
                              {formatBytes(message.attachment.size)}
                            </div>
                          </div>
                        </div>
                        <a
                          href={resolveAttachmentUrl(message.attachment.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary font-semibold hover:underline"
                        >
                          Download
                        </a>
                      </div>
                    )}

                    {message.reactions.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {message.reactions.map((r, idx) => (
                          <button
                            key={idx}
                            onClick={() => addReaction(message.id, r.emoji)}
                            className={`px-2 py-1 rounded-full border text-xs flex items-center gap-1 transition-colors ${
                              r.users.includes(currentUser.id)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-secondary hover:bg-accent"
                            }`}
                          >
                            {r.emoji} {r.count}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 flex gap-1 bg-card border border-border rounded shadow-sm">
                    <button
                      onClick={() =>
                        setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)
                      }
                      className="p-1.5 hover:bg-accent rounded"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => togglePinMessage(message.id)}
                      className="p-1.5 hover:bg-accent rounded"
                    >
                      {message.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                    </button>
                  </div>

                  {showEmojiPicker === message.id && (
                    <div className="absolute bg-card border border-border p-2 rounded-lg shadow-lg flex gap-1 flex-wrap w-40 top-8 right-0 z-10">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => addReaction(message.id, emoji)}
                          className="p-1 hover:bg-accent rounded text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border bg-card shrink-0">
            <input
              ref={docInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,application/pdf"
              onChange={handleDocumentSelected}
            />
            {pendingAttachment && (
              <div className="border border-dashed border-border rounded-lg bg-muted/30 p-3 flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-6 h-6 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{pendingAttachment.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatBytes(pendingAttachment.size)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setPendingAttachment(null)}
                  className="p-1 rounded hover:bg-accent text-muted-foreground"
                  aria-label="Remove attachment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {uploadError && (
              <div className="text-sm text-destructive mb-2">{uploadError}</div>
            )}
            <div className="border border-border rounded-lg overflow-hidden focus-within:border-ring transition-colors">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message #${currentChannel.name}`}
                  className="w-full bg-transparent resize-none outline-none p-3 min-h-[60px] max-h-[200px]"
                  rows={1}
                />

              <div className="flex justify-between items-center px-3 pb-3">
                <div className="flex gap-1">
                  <button
                    className="p-1.5 hover:bg-accent rounded disabled:opacity-50"
                    onClick={() => docInputRef.current?.click()}
                    disabled={uploadingDoc}
                    title="Upload document"
                  >
                    {uploadingDoc ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Paperclip className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    className="p-1.5 hover:bg-accent rounded"
                      onClick={() =>
                        setShowEmojiPicker(showEmojiPicker === "composer" ? null : "composer")
                      }
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>

                  <Button
                    disabled={!currentMessage.trim() && !pendingAttachment}
                    onClick={handleSendMessage}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {mainView === "files" && <FilePanel variant="embedded" />}
            {mainView === "calendar" && <CalendarPanel variant="embedded" />}
            {mainView === "team" && <TeamSnapshotPanel variant="embedded" />}
            {mainView === "events" && <TeamEventsPanel isAdmin variant="embedded" />}
          </div>
        )}
      </div>
    </div>

      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bring the team on video</DialogTitle>
            <DialogDescription>
              Launch a quick call or wire this button into a dedicated meeting experience.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Popular ways teams wire this up:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Drop a Zoom, Meet, or Teams link straight into the channel to kick off an ad-hoc call.
              </li>
              <li>
                Embed a WebRTC room (Daily, LiveKit, Twilio Video) so the button spins up an in-product
                huddle.
              </li>
              <li>
                Schedule a calendar event automatically and thread the meeting link back into chat.
              </li>
            </ul>
            <p>Pick the approach that fits your stack today and iterate toward native huddles later.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVideoModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search conversation</DialogTitle>
            <DialogDescription>Find messages or teammates across this channel.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              autoFocus
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="max-h-72 overflow-y-auto space-y-3">
              {searchResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {searchQuery.trim() ? "No matches found." : "Start typing to search messages."}
                </p>
              ) : (
                searchResults.map((message) => (
                  <div key={message.id} className="border rounded-lg p-3 text-sm space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{message.user.name}</span>
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                    <p className="text-foreground">{message.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSearchModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite teammates</DialogTitle>
            <DialogDescription>
              Share this link or regenerate a new invite code for your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Invite link</label>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="font-mono text-xs" />
                <CopyInviteButton inviteCode={inviteLink} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Team code</label>
              <div className="flex gap-2">
                <Input
                  value={inviteWorkspace?.invite_code ?? "No code"}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button variant="outline" onClick={handleGenerateInviteCode}>
                  Generate code
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
