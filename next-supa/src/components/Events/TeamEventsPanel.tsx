// src/components/Events/TeamEventsPanel.tsx
"use client";

import { useMemo, useState } from "react";
import { format, isSameDay, differenceInMinutes } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CalendarDays,
  MapPin,
  Users,
  Clock,
  Plus,
  Filter,
  Check,
  X,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RSVPStatus = "going" | "maybe" | "not_going";

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  status: RSVPStatus;
}

interface TeamEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  createdBy: string;
  attendees: TeamMember[];
  capacity?: number;
}

const currentUser: TeamMember = {
  id: "user-1",
  name: "Michael Harris",
  status: "going",
};

const initialEvents: TeamEvent[] = [
  {
    id: "design-sprint",
    title: "Design Sprint Kickoff",
    description:
      "Align on sprint goals, constraints, and prototype areas. We'll confirm expectations and owners for each activity.",
    location: "HQ Collaboration Studio",
    start: new Date("2025-02-07T14:00:00"),
    end: new Date("2025-02-07T16:00:00"),
    createdBy: "Priya Singh",
    attendees: [
      currentUser,
      { id: "user-2", name: "Sarah Chen", status: "going" },
      { id: "user-3", name: "Diego Morales", status: "maybe" },
      { id: "user-4", name: "David Kim", status: "going" },
      { id: "user-5", name: "Caleb Cunningham", status: "not_going" },
    ],
    capacity: 12,
  },
  {
    id: "roadshow",
    title: "Customer Roadshow – Chicago",
    description:
      "Out-of-town visit to enterprise customers. Travel details and room blocks inside the shared doc.",
    location: "Chicago, IL",
    start: new Date("2025-02-12T09:00:00"),
    end: new Date("2025-02-13T18:00:00"),
    createdBy: "Caleb Cunningham",
    attendees: [
      currentUser,
      { id: "user-2", name: "Sarah Chen", status: "going" },
      { id: "user-6", name: "Alex Nguyen", status: "going" },
      { id: "user-7", name: "Tara Patel", status: "maybe" },
    ],
  },
  {
    id: "all-hands",
    title: "Quarterly All-Hands",
    description:
      "Company-wide update featuring product launches, customer wins, and Q&A with leadership.",
    location: "Main Auditorium + Livestream",
    start: new Date("2025-02-20T11:00:00"),
    end: new Date("2025-02-20T12:30:00"),
    createdBy: "Brad Montgomery",
    attendees: [
      { id: "user-8", name: "Alexis Reed", status: "going" },
      { id: "user-9", name: "Marcus Allen", status: "going" },
      currentUser,
    ],
  },
];

interface TeamEventsPanelProps {
  isAdmin?: boolean;
  variant?: "page" | "embedded";
}

const statusLabels: Record<RSVPStatus, string> = {
  going: "Going",
  maybe: "Maybe",
  not_going: "Not Going",
};

export function TeamEventsPanel({
  isAdmin = true,
  variant = "page",
}: TeamEventsPanelProps) {
  const [events, setEvents] = useState<TeamEvent[]>(initialEvents);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [selectedDate, setSelectedDate] = useState<Date>(initialEvents[0].start);
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEvents[0].id);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: "",
    start: "",
    end: "",
  });

  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? events[0];

  const eventsOnSelectedDate = useMemo(
    () => events.filter((event) => isSameDay(event.start, selectedDate)),
    [events, selectedDate]
  );

  const nextEvents = useMemo(
    () => [...events].sort((a, b) => a.start.getTime() - b.start.getTime()),
    [events]
  );

  const upcomingCount = nextEvents.filter((event) => event.start > new Date()).length;

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) return;

    const created: TeamEvent = {
      id: crypto.randomUUID(),
      title: newEvent.title,
      description: newEvent.description || "Agenda coming soon.",
      location: newEvent.location || "TBD",
      start: new Date(newEvent.start),
      end: new Date(newEvent.end),
      createdBy: currentUser.name,
      attendees: [{ ...currentUser, status: "going" }],
    };

    setEvents((prev) => [...prev, created]);
    setSelectedEventId(created.id);
    setSelectedDate(created.start);
    setNewEvent({ title: "", description: "", location: "", start: "", end: "" });
    setIsCreateOpen(false);
  };

  const handleRsvp = (eventId: string, status: RSVPStatus) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;

        const attendeeIndex = event.attendees.findIndex((a) => a.id === currentUser.id);
        if (attendeeIndex >= 0) {
          const updated = [...event.attendees];
          updated[attendeeIndex] = { ...updated[attendeeIndex], status };
          return { ...event, attendees: updated };
        }

        return {
          ...event,
          attendees: [...event.attendees, { ...currentUser, status }],
        };
      })
    );
  };

  const renderAttendees = (event: TeamEvent) => (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {event.attendees.filter((a) => a.status === "going").length} going ·{" "}
        {event.attendees.filter((a) => a.status === "maybe").length} maybe ·{" "}
        {event.attendees.filter((a) => a.status === "not_going").length} not going
      </p>
      <div className="flex flex-wrap gap-2">
        {event.attendees.map((attendee) => (
          <Badge
            key={attendee.id}
            variant={attendee.status === "going" ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
            {attendee.name}
          </Badge>
        ))}
      </div>
    </div>
  );

  const wrapperClass =
    variant === "page"
      ? "min-h-screen bg-slate-50"
      : "h-full overflow-y-auto bg-background border-t border-border";
  const innerClass =
    variant === "page"
      ? "max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-6"
      : "px-4 py-4 space-y-6";

  return (
    <div className={wrapperClass}>
      <div className={innerClass}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              Plan together
            </p>
            <h1 className="text-3xl font-bold">Events & Team Schedule</h1>
            <p className="text-muted-foreground">
              Create events, see what’s next, and keep your team aligned in one place.
            </p>
          </div>

          {isAdmin && (
            <Button onClick={() => setIsCreateOpen(!isCreateOpen)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          )}
        </div>

        {isCreateOpen && (
          <Card className="border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle>New Event</CardTitle>
              <CardDescription>Admins can create events for everyone to see.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Team Planning Workshop"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={newEvent.location}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="HQ, Zoom, Offsite..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start</label>
                <Input
                  type="datetime-local"
                  value={newEvent.start}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End</label>
                <Input
                  type="datetime-local"
                  value={newEvent.end}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, end: e.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Share context, goals, prep work..."
                  rows={3}
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent}>Publish Event</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">Next Event</p>
              <div className="text-lg font-semibold">{nextEvents[0]?.title}</div>
              <p className="text-sm text-muted-foreground">
                {format(nextEvents[0]?.start ?? new Date(), "EEE, MMM d • h:mm a")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">Upcoming events</p>
              <div className="text-3xl font-bold">{upcomingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">Average attendance</p>
              <div className="text-3xl font-bold">
                {Math.round(
                  (events.reduce(
                    (total, event) =>
                      total +
                      event.attendees.filter((attendee) => attendee.status === "going").length,
                    0
                  ) /
                    (events.length || 1)) *
                    1.5
                )}
                %
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">RSVP reminders</p>
              <div className="text-3xl font-bold">
                {
                  events.flatMap((event) => event.attendees).filter((attendee) => attendee.status === "maybe")
                    .length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Plan view</CardTitle>
              <CardDescription>Select how you want to view upcoming events.</CardDescription>
            </div>
            <Tabs value={view} onValueChange={(value) => setView(value as "calendar" | "list")}>
              <TabsList>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="list">Simple list</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Tabs value={view}>
              <TabsContent value="calendar" className="space-y-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  modifiers={{
                    event: events.map((event) => event.start),
                  }}
                  modifiersClassNames={{
                    event: "bg-primary text-primary-foreground",
                  }}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      {eventsOnSelectedDate.length > 0
                        ? `Events on ${format(selectedDate, "EEEE, MMM d")}`
                        : "No events on this day"}
                    </p>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Filter className="w-4 h-4" />
                      Filter
                    </Button>
                  </div>

                  {eventsOnSelectedDate.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      className={cn(
                        "border rounded-lg p-3 cursor-pointer transition-all",
                        selectedEventId === event.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/40"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{event.title}</div>
                          <p className="text-xs text-muted-foreground">
                            {format(event.start, "h:mm a")} – {format(event.end, "h:mm a")}
                          </p>
                        </div>
                        <Badge variant="outline">{event.location}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="list" className="space-y-4">
                {nextEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-colors",
                      selectedEventId === event.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(event.start, "EEE, MMM d • h:mm a")}
                        </p>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.attendees.filter((attendee) => attendee.status === "going").length} going
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-primary/30 shadow-sm">
          <CardHeader>
            <CardTitle>{selectedEvent.title}</CardTitle>
            <CardDescription>
              Created by {selectedEvent.createdBy} ·{" "}
              {differenceInMinutes(selectedEvent.end, selectedEvent.start)} min session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CalendarDays className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">
                    {format(selectedEvent.start, "EEEE, MMM d")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(selectedEvent.start, "h:mm a")} – {format(selectedEvent.end, "h:mm a")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{selectedEvent.location}</p>
                  <p className="text-xs text-muted-foreground">Shared in calendar invite</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">
                    {selectedEvent.attendees.filter((attendee) => attendee.status === "going").length}{" "}
                    attending
                  </p>
                  <p className="text-xs text-muted-foreground">RSVP for headcount</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">Overview</p>
              <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
            </div>

            <div className="space-y-4">
              <p className="font-semibold">Your RSVP</p>
              <div className="flex flex-wrap gap-2">
                {(["going", "maybe", "not_going"] as RSVPStatus[]).map((status) => (
                  <Button
                    key={status}
                    variant={selectedEvent.attendees.some(
                      (attendee) => attendee.id === currentUser.id && attendee.status === status
                    )
                      ? "default"
                      : "outline"}
                    onClick={() => handleRsvp(selectedEvent.id, status)}
                    className="gap-2"
                  >
                    {status === "going" && <Check className="w-4 h-4" />}
                    {status === "maybe" && <HelpCircle className="w-4 h-4" />}
                    {status === "not_going" && <X className="w-4 h-4" />}
                    {statusLabels[status]}
                  </Button>
                ))}
              </div>
            </div>

            <div>{renderAttendees(selectedEvent)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Event planning will keep evolving based on your user stories.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="border rounded-lg p-4">
              <p className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Attendance analytics
              </p>
              <p className="text-sm text-muted-foreground">
                Admins will be able to see historical attendance rates, heatmaps by event type, and
                notify low RSVP segments.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Smart filters & travel planning
              </p>
              <p className="text-sm text-muted-foreground">
                Filter by timezones, request rides or lodging for out-of-town events, and upload
                highlight reels or results after the event wraps.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
