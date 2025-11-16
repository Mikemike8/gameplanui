import React from "react";
import { FiUsers, FiCalendar, FiClock } from "react-icons/fi";

interface EventStatsCardProps {
  className?: string;
}

export const EventStatsCard = ({ className }: EventStatsCardProps) => {
  return (
    <div
      className={`w-full md:col-span-4 overflow-hidden rounded border border-stone-300 ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-stone-200">
        <h3 className="flex items-center gap-1.5 font-medium text-stone-700">
          <FiUsers /> Event Stats
        </h3>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col justify-between h-auto md:h-64 space-y-4">
        {/* Total Attendees */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex items-center gap-2 text-stone-600">
            <FiUsers className="text-stone-500" />
            <span>Total Attendees</span>
          </div>
          <span className="font-semibold text-stone-800 text-right">450</span>
        </div>

        {/* Upcoming Event */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex items-center gap-2 text-stone-600">
            <FiCalendar className="text-stone-500" />
            <span>Next Event</span>
          </div>
          <span className="font-semibold text-stone-800 text-right">Oct 25, 2025</span>
        </div>

        {/* Event Duration */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex items-center gap-2 text-stone-600">
            <FiClock className="text-stone-500" />
            <span>Duration</span>
          </div>
          <span className="font-semibold text-stone-800 text-right">10:00 AM – 5:00 PM</span>
        </div>
      </div>
    </div>
  );
};
