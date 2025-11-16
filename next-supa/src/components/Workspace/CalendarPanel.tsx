// src/components/Workspace/CalendarPanel.tsx
"use client";

import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, MapPin, Users, Check, X } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  status: "attending" | "declined" | "pending";
}

interface Event {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  location: string;
  attendees: TeamMember[];
  totalAttending: number;
  currentUserStatus: "attending" | "declined" | "pending";
}

interface CalendarPanelProps {
  variant?: "page" | "embedded";
}

export function CalendarPanel({ variant = "embedded" }: CalendarPanelProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      name: "Tech Innovators Summit 2025",
      startDate: new Date(2025, 9, 25, 10, 0),
      endDate: new Date(2025, 9, 25, 17, 0),
      location: "San Francisco, CA",
      totalAttending: 12,
      currentUserStatus: "pending",
      attendees: [
        {
          id: "1",
          name: "Sarah Johnson",
          avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah",
          status: "attending",
        },
        {
          id: "2",
          name: "Mike Chen",
          avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Mike",
          status: "attending",
        },
        {
          id: "3",
          name: "Emily Rodriguez",
          avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Emily",
          status: "attending",
        },
      ],
    },
    {
      id: "2",
      name: "Team Sprint Planning",
      startDate: new Date(2025, 9, 28, 9, 0),
      endDate: new Date(2025, 9, 28, 11, 0),
      location: "Virtual - Zoom",
      totalAttending: 8,
      currentUserStatus: "attending",
      attendees: [
        {
          id: "1",
          name: "Sarah Johnson",
          avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah",
          status: "attending",
        },
        {
          id: "4",
          name: "Alex Kim",
          avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Alex",
          status: "attending",
        },
      ],
    },
    {
      id: "3",
      name: "Q4 Review Meeting",
      startDate: new Date(2025, 9, 30, 14, 0),
      endDate: new Date(2025, 9, 30, 16, 0),
      location: "Conference Room B",
      totalAttending: 15,
      currentUserStatus: "declined",
      attendees: [
        {
          id: "2",
          name: "Mike Chen",
          avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Mike",
          status: "attending",
        },
        {
          id: "3",
          name: "Emily Rodriguez",
          avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Emily",
          status: "attending",
        },
        {
          id: "5",
          name: "David Park",
          avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=David",
          status: "attending",
        },
      ],
    },
    {
      id: "4",
      name: "Workshop: Design Thinking",
      startDate: new Date(2025, 10, 5, 13, 0),
      endDate: new Date(2025, 10, 6, 17, 0),
      location: "Innovation Lab",
      totalAttending: 20,
      currentUserStatus: "pending",
      attendees: [
        {
          id: "1",
          name: "Sarah Johnson",
          avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah",
          status: "attending",
        },
        {
          id: "3",
          name: "Emily Rodriguez",
          avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Emily",
          status: "attending",
        },
      ],
    },
  ]);

  const handleRSVP = (eventId: string, status: "attending" | "declined") => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId
          ? {
              ...event,
              currentUserStatus: status,
              totalAttending:
                status === "attending"
                  ? event.totalAttending + (event.currentUserStatus === "attending" ? 0 : 1)
                  : event.totalAttending - (event.currentUserStatus === "attending" ? 1 : 0),
            }
          : event
      )
    );
  };

  const getEventsForDate = (date: Date) =>
    events.filter(
      (event) =>
        isSameDay(event.startDate, date) || (date >= event.startDate && date <= event.endDate)
    );

  const upcomingEvents = events
    .filter((event) => event.startDate >= new Date())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const containerClass =
    variant === "page"
      ? "min-h-screen bg-slate-50"
      : "h-full overflow-y-auto bg-background border-t border-border";

  const innerClass =
    variant === "page"
      ? "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
      : "px-4 py-4 space-y-6";

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{event.name}</CardTitle>
            <CardDescription className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {format(event.startDate, "MMM dd, yyyy")}
                  {!isSameDay(event.startDate, event.endDate) &&
                    ` - ${format(event.endDate, "MMM dd, yyyy")}`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>
                  {format(event.startDate, "h:mm a")} - {format(event.endDate, "h:mm a")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            </CardDescription>
          </div>
          <Badge>{event.totalAttending} going</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex -space-x-2">
          {event.attendees.map((member) => (
            <Avatar key={member.id} className="border-2 border-background">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant={event.currentUserStatus === "attending" ? "default" : "outline"}
            size="sm"
            onClick={() => handleRSVP(event.id, "attending")}
          >
            <Check className="w-4 h-4 mr-1" />
            Attend
          </Button>
          <Button
            variant={event.currentUserStatus === "declined" ? "destructive" : "outline"}
            size="sm"
            onClick={() => handleRSVP(event.id, "declined")}
          >
            <X className="w-4 h-4 mr-1" />
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={containerClass}>
      <div className={innerClass}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Team Calendar</h1>
            <p className="text-muted-foreground">
              Track upcoming events and coordinate schedules with your team.
            </p>
          </div>
          <Button size="sm">Create Event</Button>
        </div>

        <Tabs value={view} onValueChange={(val) => setView(val as "calendar" | "list")}>
          <TabsList className="grid w-full max-w-[280px] grid-cols-2">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
              <Card>
                <CardContent className="pt-6">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                    modifiers={{
                      event: events.map((event) => event.startDate),
                    }}
                  />
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Events on {format(selectedDate, "MMM d")}</h3>
                {getEventsForDate(selectedDate).length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No events scheduled for this day.
                    </CardContent>
                  </Card>
                ) : (
                  getEventsForDate(selectedDate).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
