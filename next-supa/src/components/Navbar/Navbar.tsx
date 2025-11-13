"use client";

import React from "react";
import { AccountToggle } from "./AccountToggle";
import { Search } from "./Search";
import { RouteSelect } from "./RouteSelect";
import { Plan } from "./Plan";
import { FiPlayCircle } from "react-icons/fi"; // Logo icon

interface NavbarProps {
  email: string;
}

export const Navbar: React.FC<NavbarProps> = ({ email }) => {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
      {/* Left: Inline App Logo */}
      <div className="flex items-center gap-2 cursor-pointer">
        <FiPlayCircle className="w-8 h-8 text-violet-600" />
        <span className="hidden sm:inline font-bold text-lg text-stone-900">
          GamePlan
        </span>
      </div>

      {/* Center: Navigation Links */}
      <div className="flex items-center gap-6">
        <RouteSelect />
      </div>

      {/* Right: Search + Plan + Account Menu */}
      <div className="flex items-center gap-4">
        <Search />
        <Plan />
        <AccountToggle email={email} />
      </div>
    </nav>
  );
};
