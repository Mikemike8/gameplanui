"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { BackendUser } from "@/lib/workspaces";

interface UserContextValue {
  user: BackendUser | null;
  loading: boolean;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load the stored backend user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("backendUser");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}
