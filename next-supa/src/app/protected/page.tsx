"use client";

import { Dashboard } from "@/components/Dashboard/Dashboard";

export default function ProtectedPage() {
  const email = "mike@gmail.com"; // Example: fetch dynamically or hardcode for now

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto">
      <div className="border-b border-stone-300 pb-2 mb-4">
        <h1 className="text-xl font-semibold">Welcome back, {email} 👋</h1>
        <p className="text-stone-500 text-sm">
          Here’s your dashboard summary and chat feed.
        </p>
      </div>
      <Dashboard />
    </div>
  );
}
