
"use client";

import React from "react";
import { FiCalendar, FiMoreHorizontal } from "react-icons/fi";

interface UpcomingEventsProps {
    // You can add props here if needed
    events: Array<{
        id: string;
        name: string;
        date: string;
        attendees: number;
    }>;
}

export const UpcomingEvents = ({ events }: UpcomingEventsProps) => {
  // Example click handler for signing up
  const handleSignUp = (eventId: string) => {
    alert(`Signed up for event ${eventId}!`);
    // You could call your backend or Supabase here
  };

  return (
    <div  className="col-span-12 p-4 rounded border border-stone-300">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 font-medium">
          <FiCalendar /> Upcoming Events
        </h3>
        <button className="text-sm text-violet-500 hover:underline">
          See all
        </button>
      </div>

      {/* Table */}
      <table className="w-full table-auto">
        <TableHead />
        <tbody>
          <TableRow
            id="#EVT001"
            name="Launch Webinar"
            date="Oct 23rd"
            attendees={150}
            order={1}
            onSignUp={handleSignUp}
          />
          <TableRow
            id="#EVT002"
            name="Networking Meetup"
            date="Oct 20th"
            attendees={45}
            order={2}
            onSignUp={handleSignUp}
          />
          <TableRow
            id="#EVT003"
            name="Product Demo"
            date="Oct 19th"
            attendees={80}
            order={3}
            onSignUp={handleSignUp}
          />
        </tbody>
      </table>
    </div>
  );
};

const TableHead = () => (
  <thead>
    <tr className="text-sm font-normal text-stone-500">
      <th className="text-start p-1.5">Event ID</th>
      <th className="text-start p-1.5">Event Name</th>
      <th className="text-start p-1.5">Date</th>
      <th className="text-start p-1.5">Attendees</th>
      <th className="text-start p-1.5">Action</th>
    </tr>
  </thead>
);

const TableRow = ({
  id,
  name,
  date,
  attendees,
  order,
  onSignUp,
}: {
  id: string;
  name: string;
  date: string;
  attendees: number;
  order: number;
  onSignUp: (id: string) => void;
}) => (
  <tr className={order % 2 ? "bg-stone-100 text-sm" : "text-sm"}>
    <td className="p-1.5">
      <a href="#" className="text-violet-600 underline flex items-center gap-1">
        {id}
      </a>
    </td>
    <td className="p-1.5">{name}</td>
    <td className="p-1.5">{date}</td>
    <td className="p-1.5">{attendees}</td>
    <td className="p-1.5">
      <button
        onClick={() => onSignUp(id)}
        className="text-sm text-white bg-violet-500 hover:bg-violet-600 px-3 py-1 rounded transition-colors"
      >
        Sign Up
      </button>
    </td>
  </tr>
);
