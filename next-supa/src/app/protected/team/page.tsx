"use client";

import React from "react";
import { Dashboard } from "@/components/Dashboard/Dashboard";

interface ChatSectionProps {
  email: string;
}

export default function ChatSection({ email }: ChatSectionProps) {
  return (
    <div className="bg-white rounded-lg pb-4 shadow">
        <Dashboard />
    </div>
        
  );
}
