"use client";

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

interface User extends ApiUser {
  status: "online" | "away" | "offline";
}

interface Message extends Omit<ApiMessage, "user" | "timestamp"> {
  user: User;
  timestamp: Date;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  unreadCount?: number;
  isPrivate: boolean;
}

/* ------------------------------------------------- */
/* CONSTANTS */
/* ------------------------------------------------- */

const API_URL = "http://localhost:8000";

/* ------------------------------------------------- */
/* Component */
/* ------------------------------------------------- */

export default function TeamChannelInterface() {
  const { user: auth0User, isLoading: auth0Loading } = useUser();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);

  const [currentMessage, setCurrentMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDescription, setNewChannelDescription] = useState("");
  const [isPrivateChannel, setIsPrivateChannel] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const emojis = ["👍", "❤️", "😂", "🎉", "🚀", "👀", "🔥", "💯"];

  /* ------------------------------------------------- */
  /* Helpers                                           */
  /* ------------------------------------------------- */

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const pinnedMessages = messages.filter((m) => m.isPinned);

  /* ------------------------------------------------- */
  /* Load Current User                                 */
  /* ------------------------------------------------- */

  const loadCurrentUser = useCallback(async () => {
    if (!auth0User) return;

    const email = auth0User.email || "";
    const name = auth0User.name || auth0User.nickname || email.split("@")[0];
    const avatar =
      auth0User.picture ||
      `https://api.dicebear.com/7.x/notionists/svg?seed=${email}`;

    const res = await fetch(`${API_URL}/users/me`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, avatar }),
    });

    const apiUser: ApiUser = await res.json();

    setCurrentUser({
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      avatar: apiUser.avatar,
      status: "online",
    });
  }, [auth0User]);

  /* ------------------------------------------------- */
  /* Load Channels                                     */
  /* ------------------------------------------------- */

  const createDefaultChannel = useCallback(async () => {
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
  }, []);

  const loadChannels = useCallback(async () => {
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
  }, [createDefaultChannel]);

  /* ------------------------------------------------- */
  /* Load Messages                                     */
  /* ------------------------------------------------- */

  const loadMessages = useCallback(async () => {
    if (!currentChannel) return;

    const res = await fetch(
      `${API_URL}/messages?channel_id=${currentChannel.id}`
    );

    const data = await res.json();

    setMessages(
      data.map((msg: ApiMessage) => ({
        ...msg,
        user: msg.user
          ? { ...msg.user, status: "online" }
          : {
              id: "unknown",
              name: "Unknown User",
              email: "",
              avatar: "",
              status: "offline",
            },
        timestamp: new Date(msg.timestamp),
      }))
    );
  }, [currentChannel]);

  /* ------------------------------------------------- */
  /* Socket.IO Setup                                   */
  /* ------------------------------------------------- */

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
                user: msg.user
                  ? { ...msg.user, status: "online" }
                  : {
                      id: "unknown",
                      name: "Unknown User",
                      email: "",
                      avatar: "",
                      status: "offline",
                    },
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

    socket.on("reaction-added", () => loadMessages());

    return () => {
      socket.disconnect();
    };
  }, [loadMessages]);

  /* ------------------------------------------------- */
  /* Create Channel Handler                             */
  /* ------------------------------------------------- */

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;

    const res = await fetch(`${API_URL}/channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newChannelName.toLowerCase().replace(/\s+/g, "-"),
        description: newChannelDescription,
        is_private: isPrivateChannel,
      }),
    });

    if (!res.ok) {
      alert("Failed to create channel");
      return;
    }

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
  };

  /* ------------------------------------------------- */
  /* Message Reactions / Pinning                       */
  /* ------------------------------------------------- */

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

  const togglePinMessage = async (messageId: string) => {
    if (!currentUser) return;

    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    const newStatus = !msg.isPinned;

    await fetch(`${API_URL}/messages/${messageId}/pin`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        is_pinned: newStatus,
        user_id: currentUser.id,
      }),
    });

    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, isPinned: newStatus, pinnedBy: newStatus ? currentUser.id : undefined }
          : m
      )
    );
  };

  /* ------------------------------------------------- */
  /* Send Message                                      */
  /* ------------------------------------------------- */

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !currentUser || !currentChannel) return;

    const tempId = uuidv4();

    const optimistic: Message = {
      id: tempId,
      user: currentUser,
      content: currentMessage,
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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /* ------------------------------------------------- */
  /* Initial Loads                                     */
  /* ------------------------------------------------- */

  useEffect(() => {
    if (!auth0Loading && auth0User) {
      loadCurrentUser();
      loadChannels();
    }
  }, [auth0User, auth0Loading, loadCurrentUser, loadChannels]);

  useEffect(() => {
    if (currentChannel) {
      loadMessages();
    }
  }, [currentChannel, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ------------------------------------------------- */
  /* LOADING SCREEN                                    */
  /* ------------------------------------------------- */

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

  /* ------------------------------------------------- */
  /* FULL CHAT UI                                      */
  /* ------------------------------------------------- */

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
            <div className="flex items-center justify-between px-2 py-1 text-sm text-muted-foreground mb-2">
              <span className="font-semibold">Channels</span>

              <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
                <DialogTrigger asChild>
                  <button className="hover:text-foreground p-1 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </DialogTrigger>

                {/* Create Channel Modal */}
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Channel</DialogTitle>
                    <DialogDescription>Name your channel</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="channel-name">Channel Name</Label>
                      <Input
                        id="channel-name"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        placeholder="project-discussion"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="channel-description">Description</Label>
                      <Input
                        id="channel-description"
                        value={newChannelDescription}
                        onChange={(e) => setNewChannelDescription(e.target.value)}
                        placeholder="What is this channel used for?"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="private"
                        checked={isPrivateChannel}
                        onCheckedChange={(v) => setIsPrivateChannel(!!v)}
                      />
                      <Label htmlFor="private">Private Channel</Label>
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

            {/* Channel List */}
            <div className="space-y-1">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => {
                    setCurrentChannel(channel);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center px-2 py-2 rounded cursor-pointer transition-colors ${
                    currentChannel.id === channel.id
                      ? "bg-chat-active text-chat-active-text"
                      : "hover:bg-chat-hover text-sidebar-foreground"
                  }`}
                >
                  <Hash className="w-4 h-4 mr-2" />
                  <span className="truncate">{channel.name}</span>
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

      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="hidden md:flex h-14 border-b border-border items-center px-4 bg-card">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="font-bold truncate">{currentChannel.name}</div>
              <div className="text-sm text-muted-foreground truncate">
                {currentChannel.description}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => setShowPinnedMessages(!showPinnedMessages)}
              className="relative p-2 hover:bg-chat-hover rounded"
            >
              <Pin className="w-5 h-5" />
              {pinnedMessages.length > 0 && (
                <Badge className="absolute right-0 top-0">{pinnedMessages.length}</Badge>
              )}
            </button>
            <button className="p-2 hover:bg-chat-hover rounded">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-chat-hover rounded">
              <Users className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-chat-hover rounded">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pinned Messages */}
        {showPinnedMessages && pinnedMessages.length > 0 && (
          <div className="bg-card border-b border-border p-3">
            {pinnedMessages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <strong>{msg.user.name}:</strong> {msg.content}
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3 group">
              <img
                src={message.user.avatar}
                className="w-10 h-10 rounded"
                alt={message.user.name}
              />

              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold">{message.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.timestamp)}
                  </span>
                  {message.isPinned && (
                    <span className="text-xs flex items-center text-primary gap-1">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                </div>

                <div className="mt-1">{message.content}</div>

                {/* Reactions */}
                <div className="flex gap-1 mt-2 flex-wrap">
                  {message.reactions.map((r, idx) => (
                    <button
                      key={idx}
                      onClick={() => addReaction(message.id, r.emoji)}
                      className={`px-2 py-1 rounded-full border text-xs flex items-center gap-1 ${
                        r.users.includes(currentUser.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      }`}
                    >
                      {r.emoji} {r.count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Controls */}
              <div className="opacity-0 group-hover:opacity-100 transition">
                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      setShowEmojiPicker(
                        showEmojiPicker === message.id ? null : message.id
                      )
                    }
                    className="p-1 hover:bg-chat-hover rounded"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => togglePinMessage(message.id)}
                    className="p-1 hover:bg-chat-hover rounded"
                  >
                    {message.isPinned ? (
                      <PinOff className="w-4 h-4" />
                    ) : (
                      <Pin className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Emoji Picker */}
                {showEmojiPicker === message.id && (
                  <div className="absolute bg-card p-2 rounded shadow-lg flex gap-1 flex-wrap w-32">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addReaction(message.id, emoji)}
                        className="p-1 hover:bg-chat-hover rounded text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card">
          <div className="border rounded-lg p-2">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message #${currentChannel.name}`}
              className="w-full bg-transparent resize-none outline-none p-2"
              rows={2}
            />

            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-2">
                <button className="p-2 hover:bg-chat-hover rounded">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-chat-hover rounded">
                  <Smile className="w-5 h-5" />
                </button>
              </div>

              <Button
                disabled={!currentMessage.trim()}
                onClick={handleSendMessage}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
