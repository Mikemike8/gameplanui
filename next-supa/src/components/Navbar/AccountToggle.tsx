"use client";
import React, { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useUser } from '@auth0/nextjs-auth0/client';

interface AccountToggleProps {
  email: string;
}

export const AccountToggle: React.FC<AccountToggleProps> = ({ email }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, isLoading } = useUser();

  // If loading, show placeholder
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-1">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        <div className="hidden sm:block w-20 h-4 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  // Get user info from Auth0
  const avatar = user?.picture || `https://api.dicebear.com/9.x/notionists/svg?seed=${email}`;
  const displayName = user?.name || user?.nickname || email.split("@")[0];

  const logout = () => {
    router.push('/auth/logout');  // Updated path to match new middleware setup
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 hover:bg-stone-200 rounded transition"
      >
        <img
          src={avatar}
          alt="avatar"
          className="w-8 h-8 rounded-full bg-violet-500 shadow object-cover"  // Added object-cover to ensure the image fills the circular container without distortion
        />
        <span className="hidden sm:block text-sm font-bold truncate max-w-[120px]">
          {displayName}
        </span>
        {isOpen ? (
          <FiChevronUp className="text-xs" />
        ) : (
          <FiChevronDown className="text-xs" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md p-2 text-sm text-stone-700 z-50">
          <p className="cursor-pointer hover:text-violet-600 transition-colors">
            Account Settings
          </p>
          <p
            onClick={logout}
            className="cursor-pointer hover:text-red-500 transition-colors"
          >
            Logout
          </p>
        </div>
      )}
    </div>
  );
};