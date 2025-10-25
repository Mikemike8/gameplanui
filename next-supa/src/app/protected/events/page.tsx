"use client";

import React from "react";
import { Eventboard } from "@/components/Dashboard/EventBoard/Eventboard";

interface ChatSectionProps {
  email: string;
}

export default function ChatSection({ email }: ChatSectionProps) {
  return (
    <div className="bg-transparent rounded-lg pb-0 shadow">
        <Eventboard />
    </div>
        
  );
}
