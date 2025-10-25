"use client";

import React from "react";
import { Eventboard } from "@/components/Dashboard/EventBoard/Eventboard";

// No props on the page component
export default function EventsPage() {
  return (
    <div className="bg-transparent rounded-lg pb-0 shadow">
      <Eventboard />
    </div>
  );
}
