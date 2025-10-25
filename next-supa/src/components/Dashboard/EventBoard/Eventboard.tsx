import React, { useState } from "react";
import { TopBar } from "../TopBar";
import { EventGrid } from "./EventGrid";
import { EventCardWide } from "./EventCardWide";
import { EventStatsCard } from "./EventStats";
import { UpcomingEvents } from "./UpcomingEvent";
import { eventNames } from "process";

interface UpcomingEventsProps {
    className?: string;
}




export const Eventboard = ({ className }: UpcomingEventsProps) => {

  return (
    <div className={`grid bg-white grid-cols-12 gap-4 overflow-y-auto ${className}`}>
      {/* Top Bar */}
      <div className="col-span-12">
        <TopBar />
      </div>

   
      {/* Event Grid */}
      <div className="col-span-12">
        <EventGrid />
      </div>

      {/* Main Cards Row */}
      <EventCardWide className="col-span-12 md:col-span-8" />
      <EventStatsCard className="col-span-12 md:col-span-4" />

         {/* Upcoming Events */}
      <div className="col-span-12">
        <UpcomingEvents  events={[]} />
      </div>


      {/* Footer / Last Updated */}
      <div className="col-span-12 p-4 border-t">
        <p className="text-xs text-stone-500">
          Last updated: August 8th, 2023 at 10:00 AM
        </p>
      </div>
    </div>
  );
};
