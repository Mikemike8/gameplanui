"use client";

import React from "react";
import { AccountToggle } from "./AccountToggle";
import { Search } from "./Search";
import { RouteSelect } from "./RouteSelect";
import { Plan } from "./Plan";

interface SidebarProps {
  email: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ email }) => {
  return (
    <div>
      <div className="overflow-y-scroll sticky top-4 h-[calc(100vh-32px-48px)]">
        <AccountToggle email={email} />
        <Search />
        <RouteSelect />
      </div>

      <Plan />
    </div>
  );
};
