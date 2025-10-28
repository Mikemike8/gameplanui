"use client";

import React, { useState } from "react";
import { FiCommand, FiSearch } from "react-icons/fi";
import { CommandMenu } from "./CommandMenu";

export const Search = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Navbar Search / Command Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 px-3 py-1.5 rounded bg-stone-100 hover:bg-stone-200 transition text-sm"
      >
        <FiSearch className="w-4 h-4" />
        <span className="hidden sm:inline">Search</span>
        <span className="flex items-center gap-0.5 text-xs ml-2 bg-stone-50 px-1 rounded shadow">
          <FiCommand />K
        </span>
      </button>

      {/* Global Command Menu */}
      <CommandMenu open={open} setOpen={setOpen} />
    </>
  );
};
