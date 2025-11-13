"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import {
  FiHome,
  FiUsers,
  FiMessageCircle,
  FiCalendar,
  FiClock,
  FiLink,
  FiSettings,
  FiBell,
  FiFolder,
  FiGrid,
  FiPlusCircle,
  FiLogIn,
} from "react-icons/fi";

interface RouteItem {
  title: string;
  href: string;
  Icon: any;
}

const workspaceRoutes: RouteItem[] = [
  { title: "My Spaces", href: "/protected/spaces", Icon: FiGrid },
  { title: "Create Space", href: "/protected/spaces/create", Icon: FiPlusCircle },
  { title: "Join Space", href: "/protected/spaces/join/demo", Icon: FiLogIn }, // dynamic
];

const appRoutes: RouteItem[] = [
  { title: "Dashboard", href: "/protected", Icon: FiHome },
  { title: "Team", href: "/protected/team", Icon: FiUsers },
  { title: "Chat", href: "/protected/chat", Icon: FiMessageCircle },
  { title: "Calendar", href: "/protected/calendar", Icon: FiCalendar },
  { title: "Events", href: "/protected/events", Icon: FiClock },
  { title: "Files", href: "/protected/files", Icon: FiFolder },
  { title: "Notifications", href: "/protected/notifications", Icon: FiBell },
  { title: "Settings", href: "/protected/settings", Icon: FiSettings },
];

export const RouteSelect = () => {
  const pathname = usePathname();

  const isSelected = (href: string) => pathname.startsWith(href);

  const renderItem = ({ title, href, Icon }: RouteItem) => (
    <Tooltip key={href}>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={`flex items-center justify-center w-12 h-12 rounded-lg transition ${
            isSelected(href)
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

  return (
    <TooltipProvider>
      <div className="flex items-center gap-6">
        {/* Workspace System */}
        {workspaceRoutes.map(renderItem)}

        <div className="w-px h-8 bg-stone-300" />

        {/* App Pages */}
        {appRoutes.map(renderItem)}
      </div>
    </TooltipProvider>
  );
};
