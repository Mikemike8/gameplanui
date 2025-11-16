"use client";

import React from "react";
import { useUser } from "@/context/UserContext";

export const Navbar = () => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <nav className="h-14 bg-white border-b flex items-center px-4">
        <span className="text-stone-500 text-sm">Loading...</span>
      </nav>
    );
  }

  return (
    <nav className="h-14 bg-white border-b flex items-center justify-between px-4">
      <span className="font-semibold">Team Workspace</span>

      {user ? (
        <div className="flex items-center gap-2">
          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
          <span className="text-sm">{user.name}</span>
        </div>
      ) : (
        <span className="text-stone-500 text-sm">No user</span>
      )}
    </nav>
  );
};
