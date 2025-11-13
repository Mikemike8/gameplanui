"use client"
// src/components/TeamChannelInterface.tsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Send,
  Hash,
  Smile,
  Paperclip,
  MoreVertical,
  Search,
  Users,
  Pin,
  Reply,
  Plus,
  X,
  Settings,
  PinOff,
  Menu,
} from "lucide-react";
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
import { useUser } from "@auth0/nextjs-auth0/client";

/* ------------------------------------------------- */
/* Types */
/* ------------------------------------------------- */
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
  user: ApiUser;
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

/* Local UI types */
interface User extends ApiUser {
  status: "online" | "away" | "offline";
}

interface Message extends Omit<ApiMessage, "user" | "timestamp"> {
  user: User;
  timestamp: Date;
}


interface TeamChannelInterfaceProps {
  userEmail: string;
  userName: string;
  userAvatar: string;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  unreadCount?: number;
  isPrivate: boolean;
}

const API_URL = "http://localhost:8000";

/* ------------------------------------------------- */
/* Component */
/* ------------------------------------------------- */
export default function TeamChannelInterface({
  userEmail,
  userName,
  userAvatar,
}: TeamChannelInterfaceProps) {
  // Auth0 user data
  const { user: auth0User, isLoading: auth0Loading } = useUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDescription, setNewChannelDescription] = useState("");
  const [isPrivateChannel, setIsPrivateChannel] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const loadCurrentUser = useCallback(async () => {
    if (!auth0User) return;

    // Get Auth0 user data
    const userEmail = auth0User.email || "";
    const userName = auth0User.name || auth0User.nickname || userEmail.split("@")[0];
    const userAvatar = auth0User.picture || `https://api.dicebear.com/7.x/notionists/svg?seed=${userEmail}`;

    try {
      const res = await fetch(`${API_URL}/users`);
      const users: ApiUser[] = await res.json();
      let apiUser: ApiUser | undefined = users.find(u => u.email === userEmail);

      if (!apiUser) {
        const createRes = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: userName, email: userEmail, avatar: userAvatar }),
        });
        if (!createRes.ok) throw new Error("Failed to create user");
        const newUser = await createRes.json();
        // Validate the created user has required properties
        if (!newUser || !newUser.id || !newUser.name || !newUser.email || !newUser.avatar) {
          throw new Error("Invalid user data received from API");
        }
        apiUser = newUser;
      }

      // Double-check that apiUser is valid before using it
      if (!apiUser || !apiUser.id || !apiUser.name || !apiUser.email || !apiUser.avatar) {
        throw new Error("Invalid user data");
      }

      setCurrentUser({
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        avatar: apiUser.avatar,
        status: "online",
      });
    } catch (e) {
      console.error("Failed to load user:", e);
      // You might want to set an error state here or redirect to a login page
    }
  }, [auth0User]);

  /* ------------------- Default Channel ------------------- */
  const createDefaultChannel = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "general",
          description: "Team-wide announcements",
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
        isPrivate: false,
      };
      setChannels([newCh]);
      setCurrentChannel(newCh);
    } catch (e) {
      console.error(e);
    }
  }, []);

  /* ------------------- Load Channels ------------------- */
  const loadChannels = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/channels`);
      const data: ApiChannel[] = await res.json();
      if (data.length === 0) {
        await createDefaultChannel();
        return;
      }
      const mapped: Channel[] = data.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description ?? "",
        memberCount: 0,
        unreadCount: 0,
        isPrivate: c.is_private,
      }));
      setChannels(mapped);
      setCurrentChannel(mapped[0]);
    } catch (e) {
      console.error(e);
    }
  }, [createDefaultChannel]);

  /* ------------------- Load Messages ------------------- */
 const loadMessages = useCallback(async () => {
  const res = await fetch(`${API_URL}/messages?channel_id=${selectedChannelId}`);
  const data = await res.json();
  setMessages(
    data.map((msg: ApiMessage) => ({
      ...msg,
      user: { ...msg.user, status: "online" } as User,
      timestamp: new Date(msg.timestamp),
    }))
  );
}, []);


  /* ------------------- Socket.IO (FIXED) ------------------- */
useEffect(() => {
  const socket = io(API_URL, { transports: ["websocket"] });
  socketRef.current = socket;

  socket.on("connect", () => console.log("Socket connected"));
  socket.on("new-message", (msg: ApiMessage) => {
    setMessages((prev) =>
      prev.some((m) => m.id === msg.id)
        ? prev
        : [
            ...prev,
            {
              ...msg,
              user: { ...msg.user, status: "online" } as User,
              timestamp: new Date(msg.timestamp),
            },
          ]
    );
  });

  socket.on("message-pinned", (data) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === data.message_id
          ? { ...m, isPinned: data.is_pinned, pinnedBy: data.pinned_by }
          : m
      )
    );
  });

  socket.on("reaction-updated", () => loadMessages());

  return () => {
    socket.disconnect();
  };
}, [loadMessages]);

  /* ------------------- Initial Loads ------------------- */
  useEffect(() => {
    if (auth0User && !auth0Loading) {
      loadCurrentUser();
      loadChannels();
    }
  }, [auth0User, auth0Loading, loadCurrentUser, loadChannels]);

  useEffect(() => {
    if (currentChannel) loadMessages();
  }, [currentChannel, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ------------------- Handlers ------------------- */
  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newChannelName.toLowerCase().replace(/\s+/g, "-"),
          description: newChannelDescription,
          is_private: isPrivateChannel,
        }),
      });
      if (!res.ok) throw new Error();
      const ch: ApiChannel = await res.json();
      const newCh: Channel = {
        id: ch.id,
        name: ch.name,
        description: ch.description ?? "",
        memberCount: 1,
        unreadCount: 0,
        isPrivate: ch.is_private,
      };
      setChannels((prev) => [...prev, newCh]);
      setCurrentChannel(newCh);
      setIsCreateChannelOpen(false);
      setNewChannelName("");
      setNewChannelDescription("");
      setIsPrivateChannel(false);
    } catch {
      alert("Failed to create channel");
    }
  };

  const handleSendMessage = async () => {
    const content = currentMessage.trim();
    if (!content || !currentUser || !currentChannel) return;

    const tempId = uuidv4();
    const optimistic: Message = {
      id: tempId,
      user: currentUser,
      content,
      timestamp: new Date(),
      reactions: [],
      isPinned: false,
    };

    setMessages((prev) => [...prev, optimistic]);
    setCurrentMessage("");

    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          channel_id: currentChannel.id,
          user_id: currentUser.id,
        }),
      });
      if (!res.ok) throw new Error();
      const saved: ApiMessage = await res.json();
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
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  const togglePinMessage = async (messageId: string) => {
    if (!currentUser) return;
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    const newStatus = !msg.isPinned;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, isPinned: newStatus, pinnedBy: newStatus ? currentUser.id : undefined }
          : m
      )
    );

    try {
      await fetch(`${API_URL}/messages/${messageId}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_pinned: newStatus, user_id: currentUser.id }),
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, isPinned: !newStatus } : m
        )
      );
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return;
    try {
      await fetch(`${API_URL}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message_id: messageId,
          user_id: currentUser.id,
          emoji,
        }),
      });
    } catch (e) {
      console.error(e);
    }
    setShowEmojiPicker(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const emojis = ["👍", "❤️", "😂", "🎉", "🚀", "👀", "✅", "🔥"];
  const pinnedMessages = messages.filter((m) => m.isPinned);

  /* ------------------- Loading Guard ------------------- */
  if (auth0Loading || !auth0User || !currentUser || !currentChannel) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  /* ------------------- JSX ------------------- */
  return (
    <div className="flex h-screen bg-background text-foreground flex-col md:flex-row overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden p-3 bg-card border-b border-border flex items-center justify-between shrink-0"
      >
        <Menu className="w-5 h-5" />
        <span className="text-sm font-semibold ml-2 truncate">{currentChannel.name}</span>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:relative z-50 md:z-0 inset-0 md:inset-auto w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-3 md:p-4 border-b border-sidebar-border flex items-center justify-between shrink-0">
          <h1 className="text-lg md:text-xl font-bold text-sidebar-foreground">Team Workspace</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 hover:bg-chat-hover rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-w-0">
          <div className="p-2 md:p-3">
            <div className="flex items-center justify-between px-2 py-1 text-xs md:text-sm text-muted-foreground mb-2">
              <span className="font-semibold">Channels</span>
              <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
                <DialogTrigger asChild>
                  <button className="hover:text-foreground p-1 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="w-[90vw] sm:w-full">
                  <DialogHeader>
                    <DialogTitle>Create New Channel</DialogTitle>
                    <DialogDescription>Create a new channel for your team</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="channel-name">Channel Name</Label>
                      <Input
                        id="channel-name"
                        placeholder="e.g. project-alpha"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="channel-description">Description</Label>
                      <Input
                        id="channel-description"
                        placeholder="What's this channel about?"
                        value={newChannelDescription}
                        onChange={(e) => setNewChannelDescription(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="private-channel"
                        checked={isPrivateChannel}
                        onCheckedChange={(checked: boolean) => setIsPrivateChannel(checked)}
                      />
                      <Label htmlFor="private-channel" className="text-sm cursor-pointer">
                        Make private
                      </Label>
                    </div>
                  </div>
                  <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateChannelOpen(false)}
                      className="text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateChannel}
                      className="text-sm"
                    >
                      Create
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-0.5">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => {
                    setCurrentChannel(channel);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center justify-between px-2 py-2 md:py-1.5 rounded cursor-pointer text-xs md:text-sm transition-colors ${
                    currentChannel.id === channel.id
                      ? "bg-chat-active text-chat-active-text font-medium"
                      : "hover:bg-chat-hover text-sidebar-foreground"
                  }`}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <Hash className="w-3 h-3 md:w-4 md:h-4 mr-2 shrink-0" />
                    <span className="truncate">{channel.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed md:hidden inset-0 bg-black/30 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="hidden md:flex h-12 md:h-16 border-b border-border items-center justify-between px-3 md:px-4 bg-card shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            <Hash className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <h2 className="font-bold text-sm md:text-lg text-foreground truncate">{currentChannel.name}</h2>
              <p className="text-xs text-muted-foreground truncate">{currentChannel.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 md:space-x-3 shrink-0">
            <button
              onClick={() => setShowPinnedMessages(!showPinnedMessages)}
              className="p-1 md:p-2 hover:bg-chat-hover rounded text-muted-foreground hover:text-foreground transition-colors relative"
            >
              <Pin className="w-4 h-4 md:w-5 md:h-5" />
              {pinnedMessages.length > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs h-4 min-w-4 px-1 flex items-center justify-center">
                  {pinnedMessages.length}
                </Badge>
              )}
            </button>
            <button className="p-1 md:p-2 hover:bg-chat-hover rounded text-muted-foreground hover:text-foreground transition-colors">
              <Users className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button className="p-1 md:p-2 hover:bg-chat-hover rounded text-muted-foreground hover:text-foreground transition-colors">
              <Search className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button className="p-1 md:p-2 hover:bg-chat-hover rounded text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Pinned panel */}
        {showPinnedMessages && pinnedMessages.length > 0 && (
          <div className="bg-pinned-bg border-b border-pinned-border p-2 md:p-3 shrink-0">
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="text-xs md:text-sm font-semibold text-pinned-text flex items-center gap-1 shrink-0">
                <Pin className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Pinned Messages</span>
                <span className="sm:hidden">Pinned</span>
              </h3>
              <button
                onClick={() => setShowPinnedMessages(false)}
                className="text-pinned-text hover:opacity-70 shrink-0 transition-opacity"
              >
                <X className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
            <div className="space-y-1 overflow-x-auto">
              {pinnedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="text-xs md:text-sm text-pinned-text bg-card rounded p-1.5 md:p-2 whitespace-nowrap md:whitespace-normal"
                >
                  <span className="font-medium">{msg.user.name}:</span>{" "}
                  <span className="truncate inline">{msg.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4 bg-background min-w-0">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground mt-4 md:mt-8 text-sm md:text-base">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`group hover:bg-card -mx-2 md:-mx-4 px-2 md:px-4 py-1.5 md:py-2 border-l-4 transition-colors ${
                  message.isPinned ? "border-pinned-border bg-pinned-bg/50" : "border-transparent"
                }`}
              >
                <div className="flex items-start space-x-2 md:space-x-3 min-w-0">
                  <div className="shrink-0 relative">
                    <img
                      src={message.user.avatar}
                      alt={message.user.name}
                      className="w-7 h-7 md:w-10 md:h-10 rounded"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 rounded-full border-2 border-background bg-online"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline space-x-1 md:space-x-2 flex-wrap gap-1">
                      <span className="font-semibold text-foreground text-xs md:text-base">
                        {message.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                      {message.isPinned && (
                        <span className="flex items-center text-xs text-pinned-text">
                          <Pin className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                          Pinned
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 md:mt-1 text-foreground text-xs md:text-base break-words">
                      {message.content}
                    </div>
                    {message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5 md:mt-2">
                        {message.reactions.map((reaction, idx) => (
                          <button
                            key={idx}
                            onClick={() => addReaction(message.id, reaction.emoji)}
                            className={`inline-flex items-center space-x-0.5 md:space-x-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs border transition-colors ${
                              reaction.users.includes(currentUser.id)
                                ? "bg-chat-active border-primary text-chat-active-text"
                                : "bg-secondary border-border hover:border-primary/50"
                            }`}
                          >
                            <span>{reaction.emoji}</span>
                            <span className="text-xs">{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 md:space-x-1 shrink-0">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)
                        }
                        className="p-0.5 md:p-1 hover:bg-chat-hover rounded text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Smile className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                      {showEmojiPicker === message.id && (
                        <div className="absolute right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg p-1 md:p-2 flex flex-wrap gap-1 z-10 w-32 md:w-auto">
                          {emojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => addReaction(message.id, emoji)}
                              className="hover:bg-chat-hover rounded p-1 text-base md:text-lg transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => togglePinMessage(message.id)}
                      className="p-0.5 md:p-1 hover:bg-chat-hover rounded text-muted-foreground hover:text-foreground transition-colors"
                      title={message.isPinned ? "Unpin" : "Pin"}
                    >
                      {message.isPinned ? (
                        <PinOff className="w-3 h-3 md:w-4 md:h-4" />
                      ) : (
                        <Pin className="w-3 h-3 md:w-4 md:h-4" />
                      )}
                    </button>
                    <button className="p-0.5 md:p-1 hover:bg-chat-hover rounded text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                      <Reply className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                    <button className="p-0.5 md:p-1 hover:bg-chat-hover rounded text-muted-foreground hover:text-foreground transition-colors">
                      <MoreVertical className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-2 md:p-4 border-t border-border bg-card shrink-0">
          <div className="bg-card rounded-lg border border-input focus-within:border-ring transition-colors">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message #${currentChannel.name}`}
              className="w-full bg-transparent px-2 md:px-4 py-2 md:py-3 text-xs md:text-base text-foreground placeholder-muted-foreground resize-none focus:outline-none"
              rows={2}
            />
            <div className="flex items-center justify-between px-2 md:px-3 py-1.5 md:py-2 border-t border-border gap-2">
              <div className="flex items-center space-x-1 md:space-x-2">
                <button className="p-1 md:p-1.5 hover:bg-chat-hover rounded text-muted-foreground hover:text-foreground transition-colors">
                  <Paperclip className="w-3 h-3 md:w-5 md:h-5" />
                </button>
                <button className="p-1 md:p-1.5 hover:bg-chat-hover rounded text-muted-foreground hover:text-foreground transition-colors">
                  <Smile className="w-3 h-3 md:w-5 md:h-5" />
                </button>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
                size="sm"
                className="flex items-center space-x-0.5 md:space-x-1 text-xs md:text-base"
              >
                <Send className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}