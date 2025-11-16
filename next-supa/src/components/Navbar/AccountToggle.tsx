"use client";

import React, { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";

interface AccountToggleProps {
  email: string; // Fallback if Auth0 user not loaded
}

export const AccountToggle: React.FC<AccountToggleProps> = ({ email }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, isLoading } = useUser();

  // --- Logout handler ---
  const logout = () => {
    router.push("/auth/logout");
  };

  // --- Avatar & Name ---
  const emaill = user?.email ?? "";

  const avatar = user?.picture || `https://api.dicebear.com/9.x/notionists/svg?seed=${emaill}`;

  const displayName = user?.name || user?.nickname || (email ? email.split("@")[0] : "Guest");

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-1">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        <div className="hidden sm:block w-20 h-4 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 hover:bg-stone-200 rounded transition"
      >
        <img
          src={avatar}
          alt="avatar"
          className="w-8 h-8 rounded-full bg-violet-500 shadow object-cover"
        />
        <span className="hidden sm:block text-sm font-bold truncate max-w-[120px]">
          {displayName}
        </span>
        {isOpen ? <FiChevronUp className="text-xs" /> : <FiChevronDown className="text-xs" />}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md p-2 text-sm text-stone-700 z-50">
          <p className="cursor-pointer hover:text-violet-600 transition-colors py-1">
            Account Settings
          </p>
          <p onClick={logout} className="cursor-pointer hover:text-red-500 transition-colors py-1">
            Logout
          </p>
        </div>
      )}
    </div>
  );
};
