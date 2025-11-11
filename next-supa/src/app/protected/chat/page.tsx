"use client";

import React from "react";
import TeamChannelInterface from "@/components/Dashboard/TeamChannelInterface";

export default function ChatPage() {
  // Replace with real user data (you can fetch from Supabase or auth context)
  const userEmail = "test@example.com";
  const userName = "Test User";
  const userAvatar = "https://api.dicebear.com/7.x/notionists/svg?seed=test";

  return (
    <TeamChannelInterface
      userEmail={userEmail}
      userName={userName}
      userAvatar={userAvatar}
    />
  );
}
