"use client";

import React from "react";
import TeamChannelInterface from "@/components/Dashboard/TeamChannelInterface";
import { useUser } from "@auth0/nextjs-auth0/client";

interface ChatPageProps {
  email?: string; // optional, since we may fallback to Auth0 user
}

const ChatPage = ({ email }: ChatPageProps) => {
  const { user, isLoading } = useUser();

  if (isLoading) return <p>Loading...</p>;
  if (!user && !email) return <p>User not found</p>;

  const userEmail = email?.split("@")[0] || user?.email?.split("@")[0] || "guest";
  const userName = user?.name || user?.nickname || userEmail;
  const userAvatar =
    user?.picture || `https://api.dicebear.com/9.x/notionists/svg?seed=${userEmail}`;

  return (
    <TeamChannelInterface
      userEmail={userEmail}
      userName={userName}
      userAvatar={userAvatar}
    />
  );
};

export default ChatPage; // ✅ Default export is required
