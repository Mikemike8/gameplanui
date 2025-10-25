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
  const router = useRouter(); // ✅ create router instance
  const supabase = createClient(); // ✅ you can reuse this

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="border-b mb-4 mt-2 pb-4 border-stone-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex p-0.5 hover:bg-stone-200 rounded transition-colors relative gap-2 w-full items-center"
      >
        <img
          src="https://api.dicebear.com/9.x/notionists/svg"
          alt="avatar"
          className="size-8 rounded shrink-0 bg-violet-500 shadow"
        />
        <div className="text-start">
          <span className="text-sm font-bold block">mike Is Loading</span>
          <span className="text-xs block text-stone-500 truncate w-32">{email}</span>
        </div>

        {isOpen ? (
          <FiChevronUp className="absolute right-2 top-1/2 -translate-y-1/2 text-xs" />
        ) : (
          <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-xs" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 text-sm text-stone-500">
          <p>Account Settings</p>
          <p
            onClick={logout}
            className="cursor-pointer w-0 hover:text-red-500 transition-colors"
          >
            Logout
          </p>
        </div>
      )}
    </div>
  );
};
