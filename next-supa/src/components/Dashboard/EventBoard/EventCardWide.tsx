// EventCards.tsx
import React from "react";
import { EventCard } from "./EventCard";

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

