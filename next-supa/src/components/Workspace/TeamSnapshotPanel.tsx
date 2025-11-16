// src/components/Workspace/TeamSnapshotPanel.tsx
"use client";

import { format } from "date-fns";
import { CalendarDays, MessageSquare, Users, Activity, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TeamSnapshotPanelProps {
  variant?: "page" | "embedded";
}

const mockUpcomingEvents = [
  {
    id: "1",
    title: "Product Sync",
    datetime: new Date(Date.now() + 60 * 60 * 1000),
    location: "Zoom",
    description: "Align on sprint priorities and blockers.",
  },
  {
    id: "2",
    title: "Design QA",
    datetime: new Date(Date.now() + 3 * 60 * 60 * 1000),
    location: "Studio",
    description: "Review key flows before launch.",
  },
  {
    id: "3",
    title: "Customer Advisory Board",
    datetime: new Date(Date.now() + 26 * 60 * 60 * 1000),
    location: "Meet",
    description: "Insights from strategic customers.",
  },
];

const mockRecentMessages = [
  {
    id: "m1",
    author: "Sarah Chen",
    channel: "#launch-readiness",
    content: "Deck is updated with the final metrics.",
    timestamp: "10:42 AM",
  },
  {
    id: "m2",
    author: "Diego Morales",
    channel: "#ops",
    content: "We cleared the infra alert—no action needed.",
    timestamp: "9:55 AM",
  },
  {
    id: "m3",
    author: "Tara Patel",
    channel: "#design-system",
    content: "Tokens package v2.1 just shipped.",
    timestamp: "9:12 AM",
  },
  {
    id: "m4",
    author: "Alex Nguyen",
    channel: "#sales",
    content: "Northwind signed! Contract in Drive.",
    timestamp: "8:47 AM",
  },
  {
    id: "m5",
    author: "Priya Singh",
    channel: "#launch-readiness",
    content: "QA found one more blocker—tracking in Linear.",
    timestamp: "8:20 AM",
  },
];

export function TeamSnapshotPanel({ variant = "embedded" }: TeamSnapshotPanelProps) {
  const wrapperClass =
    variant === "page"
      ? "min-h-screen bg-slate-50"
      : "h-full overflow-y-auto bg-background border-t border-border";

  const innerClass =
    variant === "page"
      ? "max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-6"
      : "px-4 py-4 space-y-6";

  const nextEvent = mockUpcomingEvents[0];
  const unreadMessages = 8;
  const activeMembers = 12;
  const totalMembers = 15;
  const upcomingEventsCount = mockUpcomingEvents.length;
  const activityLevel = "High";

  return (
    <div className={wrapperClass}>
      <div className={innerClass}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Team Snapshot</p>
            <h1 className="text-3xl font-bold">Stay caught up in seconds</h1>
          </div>
          <Badge variant="outline" className="text-xs py-1 px-3">
            Updated just now
          </Badge>
        </div>

        {/* Next Event + Critical Alerts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardDescription className="text-primary-foreground/80">
                Next upcoming event
              </CardDescription>
              <CardTitle className="text-2xl">{nextEvent.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CalendarDays className="w-5 h-5" />
                <span>{format(nextEvent.datetime, "EEEE, MMM d • h:mm a")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-5 h-5" />
                <span>{nextEvent.location}</span>
              </div>
              <p className="text-sm text-primary-foreground/80">{nextEvent.description}</p>
              <Button variant="secondary" className="mt-2">
                Review agenda
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-destructive" />
                Important updates
              </CardTitle>
              <CardDescription>Unread chat mentions and items needing attention.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-destructive">{unreadMessages}</div>
              <p className="text-sm text-muted-foreground mb-3">
                You have {unreadMessages} unread mentions across two channels.
              </p>
              <Button variant="outline" className="text-destructive border-destructive/40">
                Jump to unread
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Upcoming events</CardDescription>
              <CardTitle className="text-3xl">{upcomingEventsCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Scheduled in the next 48 hours.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active members</CardDescription>
              <CardTitle className="text-3xl">{activeMembers}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {activeMembers} of {totalMembers} online right now.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Activity level</CardDescription>
              <CardTitle className="text-3xl flex items-baseline gap-2">
                {activityLevel}
                <Badge variant="outline" className="text-xs">
                  +24% vs yesterday
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Messages + updates in the past 24h.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Focus channels</CardDescription>
              <CardTitle className="text-3xl">3</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Launch readiness, Ops, Support.</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top upcoming activities</CardTitle>
              <CardDescription>Stay aware of what’s landing next.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockUpcomingEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-3 border rounded-lg px-3 py-2"
                >
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <p className="text-xs text-muted-foreground">
                      {format(event.datetime, "MMM d, h:mm a")} • {event.location}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent chat highlights</CardTitle>
              <CardDescription>See the last 5 messages that matter.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRecentMessages.slice(0, 5).map((message) => (
                <div key={message.id} className="border rounded-lg px-3 py-2">
                  <div className="text-sm font-semibold flex items-center justify-between gap-2">
                    <span>{message.author}</span>
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{message.channel}</p>
                  <p className="text-sm">{message.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity overview</CardTitle>
            <CardDescription>Summary of what your team touched today.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 border rounded-lg p-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">58</div>
                <p className="text-xs text-muted-foreground">Messages sent</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border rounded-lg p-3">
              <div className="p-2 rounded-full bg-accent text-accent-foreground">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">7</div>
                <p className="text-xs text-muted-foreground">New members active</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border rounded-lg p-3">
              <div className="p-2 rounded-full bg-secondary text-secondary-foreground">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">12</div>
                <p className="text-xs text-muted-foreground">Tasks moved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
