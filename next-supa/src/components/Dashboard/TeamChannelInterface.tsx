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
import { cn } from "@/lib/utils";

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

interface WorkspaceSummary {
  id: string;
  name: string;
  role: string;
  is_personal: boolean;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function TeamChannelInterface({ initialWorkspaceId }: TeamChannelInterfaceProps) {
  const { user: auth0User, isLoading: auth0Loading } = useAuth0();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [allWorkspaces, setAllWorkspaces] = useState<WorkspaceSummary[]>([]);

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
  const [mainView, setMainView] = useState<"chat" | "files" | "calendar">("chat");
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const emojis = ["👍", "❤️", "😂", "🎉", "🚀", "👀", "🔥", "💯"];
  const pinnedMessages = messages.filter((m) => m.isPinned);
  const toggleMainView = (view: "files" | "calendar") => {
    setMainView((current) => (current === view ? "chat" : view));
    setShowPinnedMessages(false);
  };
  const mainAreaButtonClass = (isActive: boolean) =>
    cn(
      "p-2 rounded transition-colors",
      isActive ? "bg-primary/10 text-primary" : "hover:bg-accent"
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

      const workspaces: WorkspaceSummary[] = await res.json();
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

    const mapped: Message[] = data.map((m) => ({
      ...m,
      user: m.user
        ? { ...m.user, status: "online" }
        : {
            id: "unknown",
            name: "Unknown",
            email: "",
            avatar: "",
            status: "offline",
          },
      timestamp: new Date(m.timestamp),
    }));

    setMessages(mapped);
  }, [currentChannel]);

  /* WebSockets */
  useEffect(() => {
    const socket = io(API_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("new-message", (msg: ApiMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [
          ...prev,
          {
            ...msg,
            user: msg.user
              ? { ...msg.user, status: "online" }
              : {
                  id: "unknown",
                  name: "Unknown",
                  email: "",
                  avatar: "",
                  status: "offline",
                },
            timestamp: new Date(msg.timestamp),
          },
        ];
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
    if (!currentMessage.trim() || !currentUser || !currentChannel) return;

    const tempId = uuidv4();
    const optimistic: Message = {
      id: tempId,
      content: currentMessage,
      user: currentUser,
      timestamp: new Date(),
      reactions: [],
      isPinned: false,
    };

    setMessages((prev) => [...prev, optimistic]);
    setCurrentMessage("");

    const res = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: optimistic.content,
        channel_id: currentChannel.id,
        user_id: currentUser.id,
      }),
    });

    if (!res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      return;
    }

    const saved = await res.json();

    setMessages((prev) =>
      prev.map((m) =>
        m.id === tempId
          ? {
              ...m,
              id: saved.id,
              timestamp: new Date(saved.timestamp),
              isPinned: saved.isPinned,
            }
          : m
      )
    );
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
              {allWorkspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    router.push(`/protected/workspace/${ws.id}/chat`);
                    setShowWorkspaceSwitcher(false);
                  }}
                  className={`w-full text-left px-2 py-2 rounded hover:bg-accent flex items-center gap-2 ${
                    ws.id === workspaceId ? "bg-accent" : ""
                  }`}
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">{ws.name}</span>
                  {ws.is_personal && <span className="text-xs text-muted-foreground">(You)</span>}
                </button>
              ))}
              <div className="border-t border-border my-2" />
              <button
                onClick={() => {
              router.push("/protected/onboarding");
              setShowWorkspaceSwitcher(false);
            }}
            className="w-full text-left px-2 py-2 rounded hover:bg-accent flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create or Join Workspace
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

            <button
              onClick={() => toggleMainView("calendar")}
              className={cn(mainAreaButtonClass(mainView === "calendar"), "hidden sm:block")}
              aria-pressed={mainView === "calendar"}
              title="Calendar"
            >
              <CalendarDays className="w-5 h-5" />
            </button>

            <button className="p-2 hover:bg-accent rounded hidden sm:block">
              <Search className="w-5 h-5" />
            </button>

            <button className="p-2 hover:bg-accent rounded hidden sm:block">
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

                    <div className="mt-1 whitespace-pre-wrap break-words">{message.content}</div>

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
                    <button className="p-1.5 hover:bg-accent rounded">
                      <Paperclip className="w-5 h-5" />
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
                    disabled={!currentMessage.trim()}
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
            {mainView === "files" ? (
              <FilePanel variant="embedded" />
            ) : (
              <CalendarPanel variant="embedded" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
