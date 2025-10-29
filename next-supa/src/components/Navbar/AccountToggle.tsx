"use client";
import React, { useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";

interface AccountToggleProps {
  email?: string; // optional now since we’ll fetch from Supabase
}

export const AccountToggle: React.FC<AccountToggleProps> = ({ email }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  // 🧩 Fetch user info on mount
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error("Error fetching user:", error);

      const user = data?.user;
      if (user) {
        const meta = user.user_metadata;
        setUserAvatar(meta?.avatar_url || "https://api.dicebear.com/9.x/notionists/svg");
        setUserName(meta?.full_name || user.email || "User");
      }
    };

    getUser();
  }, [supabase]);

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
          src={userAvatar ?? "https://api.dicebear.com/9.x/notionists/svg"}
          alt="avatar"
          className="w-8 h-8 rounded-full bg-violet-500 shadow"
        />
        <span className="hidden sm:block text-sm font-bold truncate max-w-[120px]">
          {userName ?? "Loading..."}
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
