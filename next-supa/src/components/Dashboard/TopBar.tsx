// TopBar.tsx
import React from "react";

interface TopBarProps {
  className?: string;
}

export const TopBar = ({ className }: TopBarProps) => {
  return (
    <div className={`px-3 md:px-4 py-3 md:py-4 border-b border-stone-200 ${className}`}>
      <h1 className="text-xl md:text-2xl font-bold text-stone-800">Events Board</h1>
    </div>
  );
};