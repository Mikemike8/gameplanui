"use client";

import React from "react";
import { FiCalendar } from "react-icons/fi";

interface UpcomingEventsProps {
  events: Array<{
    id: string;
    name: string;
    date: string;
    attendees: number;
  }>;
}

export const UpcomingEvents = ({ events }: UpcomingEventsProps) => {
  const handleSignUp = (eventId: string) => {
    alert(`Signed up for event ${eventId}!`);
  };

  return (
    <div className="col-span-12 p-4 rounded border border-stone-300 overflow-x-auto">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 font-medium">
          <FiCalendar /> Upcoming Events
        </h3>
        <button className="text-sm text-violet-500 hover:underline">See all</button>
      </div>

      {/* Table */}
      <div className="min-w-[600px]">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-sm font-normal text-stone-500">
              <th className="text-start p-1.5">Event ID</th>
              <th className="text-start p-1.5">Event Name</th>
              <th className="text-start p-1.5">Date</th>
              <th className="text-start p-1.5">Attendees</th>
              <th className="text-start p-1.5">Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr key={event.id} className={index % 2 ? "bg-stone-100 text-sm" : "text-sm"}>
                <td className="p-1.5">
                  <span className="text-violet-600 underline flex items-center gap-1">
                    {event.id}
                  </span>
                </td>
                <td className="p-1.5">{event.name}</td>
                <td className="p-1.5">{event.date}</td>
                <td className="p-1.5">{event.attendees}</td>
                <td className="p-1.5">
                  <button
                    onClick={() => handleSignUp(event.id)}
                    className="text-sm text-white bg-violet-500 hover:bg-violet-600 px-3 py-1 rounded transition-colors whitespace-nowrap"
                  >
                    Sign Up
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
