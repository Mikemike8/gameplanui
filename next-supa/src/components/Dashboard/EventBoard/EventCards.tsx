import React from "react";
import { FiCalendar, FiMapPin, FiUsers } from "react-icons/fi";

export const EventCards = () => {
  return (
    <>
      <EventCard
        title="Tech Innovators Summit"
        date="Oct 25, 2025"
        location="San Francisco, CA"
        attendees="320"
        status="Upcoming"
      />
      <EventCard
        title="Design Thinking Workshop"
        date="Sep 15, 2025"
        location="New York, NY"
        attendees="180"
        status="Completed"
      />
      <EventCard
        title="AI Future Forum"
        date="Nov 10, 2025"
        location="Austin, TX"
        attendees="450"
        status="Upcoming"
      />
     
    </>
  );
};

const EventCard = ({
  title,
  date,
  location,
  attendees,
  status,
}: {
  title: string;
  date: string;
  location: string;
  attendees: string;
  status: "Upcoming" | "Completed";
}) => {
  return (
    <div className="col-span-4 p-5 rounded-lg border border-stone-300 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span
          className={`text-xs px-2 py-1 rounded font-medium ${
            status === "Upcoming"
              ? "bg-green-100 text-green-700"
              : "bg-stone-200 text-stone-700"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="space-y-2 text-sm text-stone-600">
        <div className="flex items-center gap-2">
          <FiCalendar className="text-stone-500" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2">
          <FiMapPin className="text-stone-500" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2">
          <FiUsers className="text-stone-500" />
          <span>{attendees} Attendees</span>
        </div>
      </div>
    </div>
  );
};
