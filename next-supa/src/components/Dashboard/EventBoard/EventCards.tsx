
// EventCard.tsx
import React from "react";
import { FiCalendar, FiMapPin, FiUsers } from "react-icons/fi";

interface EventCardProps {
  title: string;
  date: string;
  location: string;
  attendees: string;
  status: "Upcoming" | "Completed";
}

export const EventCard = ({
  title,
  date,
  location,
  attendees,
  status,
}: EventCardProps) => {
  return (
    <div className="col-span-12 sm:col-span-6 lg:col-span-4 p-3 md:p-5 rounded-lg border border-stone-300 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-base md:text-lg font-semibold text-stone-800 line-clamp-2 flex-1">
          {title}
        </h3>
        <span
          className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap flex-shrink-0 ${
            status === "Upcoming"
              ? "bg-green-100 text-green-700"
              : "bg-stone-200 text-stone-700"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-stone-600">
        <div className="flex items-center gap-2 min-w-0">
          <FiCalendar className="text-stone-500 w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
          <span className="truncate">{date}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <FiMapPin className="text-stone-500 w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <FiUsers className="text-stone-500 w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
          <span className="truncate">{attendees} Attendees</span>
        </div>
      </div>
    </div>
  );
};