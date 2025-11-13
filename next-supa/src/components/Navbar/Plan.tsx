"use client";
import React from "react";
import { FiInfo, FiHelpCircle } from "react-icons/fi";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export const Plan = () => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Optional Info Icon with tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <FiInfo className="w-5 h-5 text-stone-600 cursor-pointer hover:text-violet-600" />
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Enterprise — Pay as you go</p>
          </TooltipContent>
        </Tooltip>

        {/* Support Icon with tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <FiHelpCircle className="w-5 h-5 text-stone-600 cursor-pointer hover:text-violet-600" />
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Contact Support</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
