// UpcomingEvents.tsx
import React from "react";
import { FiClock, FiUsers } from "react-icons/fi";

interface Event {
  id: string;
  name: string;
  date: string;
  attendees: number;
}

interface UpcomingEventsProps {
  events: Event[];
}

export const UpcomingEvents = ({ events }: UpcomingEventsProps) => {
  return (
    <div className="col-span-12 p-3 md:p-4 rounded border border-stone-300">
      <h3 className="text-sm md:text-base font-semibold text-stone-800 mb-3">
        Quick Events List
      </h3>
      <div className="space-y-2">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 md:p-3 hover:bg-stone-50 rounded transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs md:text-sm text-stone-800 truncate">
                {event.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                <FiClock className="w-3 h-3 flex-shrink-0" />
                <span>{event.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-stone-600 flex-shrink-0">
              <FiUsers className="w-3 h-3 md:w-4 md:h-4" />
              <span className="whitespace-nowrap">{event.attendees}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};