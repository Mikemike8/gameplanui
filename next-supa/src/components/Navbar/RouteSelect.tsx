"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"; 
import { IconType } from "react-icons";

import {
  FiHome,
  FiUsers,
  FiMessageCircle,
  FiCalendar,
  FiLink,
  FiClock,
  FiSettings,
  FiBell,
  FiFolder,
} from "react-icons/fi";

interface RouteItem {
  title: string;
  href: string;
  Icon: IconType;
}

const routes: RouteItem[] = [
  { title: "Dashboard", href: "/protected", Icon: FiHome },
  { title: "Team", href: "/protected/team", Icon: FiUsers },
  { title: "Chat", href: "/protected/chat", Icon: FiMessageCircle },
  { title: "Calendar", href: "/protected/calendar", Icon: FiCalendar },
  { title: "Events", href: "/protected/events", Icon: FiClock },
  { title: "Integrations", href: "/protected/integrations", Icon: FiLink },
  { title: "Files", href: "/protected/files", Icon: FiFolder },
  { title: "Notifications", href: "/protected/notifications", Icon: FiBell },
  { title: "Settings", href: "/protected/settings", Icon: FiSettings },
];

export const RouteSelect = () => {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <div className="flex items-center gap-6">
        {routes.map(({ title, href, Icon }) => {
          const selected = pathname === href;
          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={`flex items-center justify-center w-12 h-12 rounded-lg transition ${
                    selected
                      ? "bg-violet-100 text-violet-600 shadow-sm"
                      : "text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{title}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
