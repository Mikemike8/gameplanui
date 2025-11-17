// src/app/protected/events/page.tsx
"use client";

import { TeamEventsPanel } from "@/components/Events/TeamEventsPanel";

export default function EventsPage() {
  // In the future hook into auth/role. For now assume admins can create events.
  return <TeamEventsPanel isAdmin />;
}
