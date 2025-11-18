"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Bell,
  Check,
  Clock,
  MessageSquare,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Info,
  Filter,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type:
    | "event_invite"
    | "event_update"
    | "event_reminder"
    | "team_invite"
    | "message_mention"
    | "rsvp_update";
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: "event" | "team" | "message";
  isRead: boolean;
  actionRequired: boolean;
  createdAt: Date;
  metadata?: {
    eventName?: string;
    eventDate?: Date;
    teamName?: string;
    userName?: string;
    userAvatar?: string;
  };
}

interface EventSummary {
  total: number;
  attending: number;
  pending: number;
  declined: number;
  upcomingToday: number;
  upcomingWeek: number;
}

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const formatTime = (date: Date) => date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const formatDistanceToNow = (date: Date) => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
};

interface NotificationsPanelProps {
  variant?: "embedded" | "page";
}

export function NotificationsPanel({ variant = "embedded" }: NotificationsPanelProps) {
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "events">("all");
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "event_invite",
      title: "New Event Invitation",
      message: "You've been invited to Tech Innovators Summit 2025",
      relatedId: "event1",
      relatedType: "event",
      isRead: false,
      actionRequired: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      metadata: {
        eventName: "Tech Innovators Summit 2025",
        eventDate: new Date(2025, 9, 25, 10, 0),
        userName: "Sarah Johnson",
        userAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah",
      },
    },
    {
      id: "2",
      type: "event_reminder",
      title: "Event Starting Soon",
      message: "Team Sprint Planning starts in 1 hour",
      relatedId: "event2",
      relatedType: "event",
      isRead: false,
      actionRequired: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
      metadata: {
        eventName: "Team Sprint Planning",
        eventDate: new Date(2025, 9, 28, 9, 0),
      },
    },
    {
      id: "3",
      type: "rsvp_update",
      title: "RSVP Update",
      message: "Mike Chen is now attending Q4 Review Meeting",
      relatedId: "event3",
      relatedType: "event",
      isRead: true,
      actionRequired: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      metadata: {
        eventName: "Q4 Review Meeting",
        userName: "Mike Chen",
        userAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Mike",
      },
    },
    {
      id: "4",
      type: "event_update",
      title: "Event Updated",
      message: "The location for Workshop: Design Thinking has been changed",
      relatedId: "event4",
      relatedType: "event",
      isRead: true,
      actionRequired: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      metadata: {
        eventName: "Workshop: Design Thinking",
      },
    },
  ]);

  const [eventSummary] = useState<EventSummary>({
    total: 12,
    attending: 8,
    pending: 3,
    declined: 1,
    upcomingToday: 2,
    upcomingWeek: 5,
  });

  const visibleNotifications = useMemo(() => {
    if (activeTab === "all") return notifications;
    if (activeTab === "unread") return notifications.filter((notif) => !notif.isRead);
    return notifications.filter((notif) => ["event_invite", "event_update", "event_reminder", "rsvp_update"].includes(notif.type));
  }, [activeTab, notifications]);

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
  };

  const handleRSVP = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "event_invite":
        return <Calendar className="h-4 w-4 text-primary" />;
      case "event_reminder":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "team_invite":
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case "message_mention":
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case "rsvp_update":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", variant === "page" ? "p-6" : "p-4")}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Stay updated with workspace invites, mentions, and event changes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={markAllAsRead}>
            <Check className="h-4 w-4" />
            Mark all read
          </Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bell className="h-4 w-4" />
            Event summary
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold">{eventSummary.total}</div>
              <p className="text-xs text-muted-foreground">Total upcoming</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold text-primary">{eventSummary.attending}</div>
              <p className="text-xs text-muted-foreground">Attending</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold text-orange-500">{eventSummary.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold text-muted-foreground">{eventSummary.declined}</div>
              <p className="text-xs text-muted-foreground">Declined</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold text-emerald-500">{eventSummary.upcomingToday}</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold text-blue-500">{eventSummary.upcomingWeek}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Saved searches</p>
              <p className="text-lg font-semibold">Calendar + RSVP</p>
            </div>
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-4 space-y-2">
            {["Mentions in chat", "Pending invites", "Travel requests"].map((pill) => (
              <button
                key={pill}
                className="flex w-full items-center justify-between rounded-md border border-dashed px-3 py-2 text-sm hover:bg-muted"
              >
                <span>{pill}</span>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          {(["all", "unread", "events"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all" ? "All" : tab === "unread" ? "Unread" : "Events"}
            </Button>
          ))}
        </div>
        <div className="divide-y">
          {visibleNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex flex-col gap-3 px-4 py-3 transition hover:bg-muted/40 md:flex-row md:items-center",
                !notification.isRead && "bg-primary/5"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-muted p-2">{getNotificationIcon(notification.type)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{notification.title}</h3>
                    {!notification.isRead && <span className="rounded-full bg-primary/10 px-2 text-xs text-primary">New</span>}
                    {notification.actionRequired && (
                      <span className="rounded-full bg-orange-100 px-2 text-xs text-orange-600">Action required</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(notification.createdAt)}</span>
                    {notification.metadata?.eventDate && (
                      <>
                        <span>•</span>
                        <span>
                          {formatDate(notification.metadata.eventDate)} at {formatTime(notification.metadata.eventDate)}
                        </span>
                      </>
                    )}
                  </div>
                  {notification.metadata?.userName && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border bg-muted/40 p-2 text-sm">
                      <Avatar className="h-6 w-6">
                        {notification.metadata.userAvatar ? (
                          <AvatarImage src={notification.metadata.userAvatar} alt={notification.metadata.userName} />
                        ) : (
                          <AvatarFallback>{notification.metadata.userName.slice(0, 2)}</AvatarFallback>
                        )}
                      </Avatar>
                      <span>{notification.metadata.userName}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 md:ml-auto">
                {notification.type === "event_invite" && (
                  <Button size="sm" onClick={() => handleRSVP(notification.id)}>
                    Respond
                  </Button>
                )}
                {!notification.isRead && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                    Mark read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                  Dismiss
                </Button>
              </div>
            </div>
          ))}
          {visibleNotifications.length === 0 && (
            <div className="flex flex-col items-center gap-2 p-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8" />
              <p>No notifications in this tab.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
