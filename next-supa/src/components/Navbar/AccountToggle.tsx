"use client";
import React, { useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";

interface AccountToggleProps {
  email: string;
}

export const AccountToggle: React.FC<AccountToggleProps> = ({ email }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

useEffect(() => {
  console.log("useEffect ran"); // <- This should always show

  const getUserData = async () => {
    console.log("Fetching user data..."); // <- This should run

    const { data } = await supabase.auth.getUser();
    console.log("Supabase user data:", data); // <- Logs what you got

      const user = data?.user;

      if (user) {
        // Pull from user_metadata if available
        setAvatar(
          user.user_metadata?.avatar_url ||
          `https://api.dicebear.com/9.x/notionists/svg?seed=${user.email}`
        );
        setDisplayName(
          user.user_metadata?.full_name || user.email?.split("@")[0]
        );
          console.log("Avatar URL:", avatar);
      }
    };

    getUserData();
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
          src={avatar ?? "https://api.dicebear.com/9.x/notionists/svg"}
          alt="avatar"
          className="w-8 h-8 rounded-full bg-violet-500 shadow"
        />
        <span className="hidden sm:block text-sm font-bold truncate max-w-[120px]">
          {displayName || email}
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
