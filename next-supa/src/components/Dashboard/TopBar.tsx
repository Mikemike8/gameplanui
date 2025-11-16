"use client";

import React from "react";
import { Calendar } from "lucide-react";

export const TopBar = () => {
  return (
    <div className="border-b border-stone-200 px-4 sm:px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Greeting */}
        <div>
          <span className="text-sm font-bold block">🚀 Good morning, Tom!</span>
          <span className="text-xs text-stone-500 block mt-0.5">Tuesday, Aug 8th 2023</span>
        </div>

        {/* Button */}
        <button className="flex items-center justify-center gap-2 text-sm bg-stone-100 px-3 py-2 rounded transition-colors hover:bg-violet-100 hover:text-violet-700 whitespace-nowrap w-full sm:w-auto">
          <Calendar size={16} />
          <span>Prev 6 Months</span>
        </button>
      </div>
    </div>
  );
};
