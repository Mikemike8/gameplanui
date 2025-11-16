"use client";

import React from "react";
import { EventCards } from "./EventCards";

export const EventGrid = () => {
  return (
    <div className="px-4 grid gap-3 grid-cols-12">
      <EventCards />
    </div>
  );
};
