// Eventboard.tsx
"use client";

import React, { useState } from "react";
import { TopBar } from "./TopBar";
import { EventGrid } from "./EventGrid";
import { EventCardWide } from "./EventCardWide";
import { EventStatsCard } from "./EventStatsCard";
import { UpcomingEvents } from "./UpcomingEvents";

interface EventboardProps {
  className?: string;
}

export const Eventboard = ({ className }: EventboardProps) => {
  const [events] = useState([
    { id: "#EVT004", name: "Hackathon 2025", date: "Nov 18th", attendees: 230 },
    { id: "#EVT005", name: "Dev Meetup", date: "Nov 25th", attendees: 60 },
  ]);

  return (
    <div className={`grid bg-white grid-cols-12 gap-3 md:gap-4 overflow-y-auto ${className}`}>
      {/* Top Bar */}
      <div className="col-span-12">
        <TopBar />
      </div>

      {/* Event Grid */}
      <div className="col-span-12">
        <EventGrid />
      </div>

      {/* Main Cards Row */}
      <EventCardWide />
      <EventStatsCard />

      {/* Upcoming Events */}
      <div className="col-span-12">
        <UpcomingEvents events={events} />
      </div>

      {/* Footer / Last Updated */}
      <div className="col-span-12 p-3 md:p-4 border-t text-center sm:text-left">
        <p className="text-xs text-stone-500">
          Last updated: August 8th, 2023 at 10:00 AM
        </p>
      </div>
    </div>
  );
};