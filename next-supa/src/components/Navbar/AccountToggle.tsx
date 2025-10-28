"use client";
import React, { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";

interface AccountToggleProps {
  email: string;
}

export const AccountToggle: React.FC<AccountToggleProps> = ({ email }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 hover:bg-stone-200 rounded transition"
      >
        <img
          src="https://api.dicebear.com/9.x/notionists/svg"
          alt="avatar"
          className="w-8 h-8 rounded-full bg-violet-500 shadow"
        />
        <span className="hidden sm:block text-sm font-bold truncate max-w-[120px]">
          Mike Is Loading
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
