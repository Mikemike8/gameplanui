"use client";

import React from "react";
import TeamChannelInterface from "@/components/Dashboard/TeamChannelInterface";
import { useUser } from '@auth0/nextjs-auth0/client';


interface ChatPageProps {
  email: string;
}


export const ChatPage : React.FC<ChatPageProps>= ({ email }) => {

    const { user, isLoading } = useUser();
  // Replace with real user data (you can fetch from Supabase or auth context)
  const userEmail = email.split("@")[0];
  const userName =  user?.name || user?.nickname || email.split("@")[0];
  const userAvatar = user?.picture || `https://api.dicebear.com/9.x/notionists/svg?seed=${email}`;

  return (
    <TeamChannelInterface
      userEmail={userEmail}
      userName={userName}
      userAvatar={userAvatar}
    />
  );
}
