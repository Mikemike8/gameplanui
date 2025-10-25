"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";
import {
  FiHome,
  FiUsers,
  FiMessageCircle,
  FiCalendar,
  FiLink,
    FiClock,
  FiDollarSign,
  FiSettings,
} from "react-icons/fi";

interface RouteItem {
  title: string;
  href: string;
  Icon: IconType;
}

// 💼 Organized routes in a professional dashboard order
const routes: RouteItem[] = [
  { title: "Dashboard", href: "/protected", Icon: FiHome },
  { title: "Team", href: "/protected/team", Icon: FiUsers },
  { title: "Chat", href: "/protected/chat", Icon: FiMessageCircle },
  { title: "Calendar", href: "/protected/calendar", Icon: FiCalendar },
  { title: "Events", href: "/protected/events", Icon: FiClock },
  { title: "Integrations", href: "/protected/integrations", Icon: FiLink },
  { title: "Settings", href: "/protected/settings", Icon: FiSettings },
];

export const RouteSelect = () => {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      {routes.map(({ title, href, Icon }) => (
        <Route
          key={href}
          title={title}
          href={href}
          Icon={Icon}
          selected={pathname === href}
        />
      ))}
    </div>
  );
};

const Route = ({
  selected,
  Icon,
  title,
  href,
}: {
  selected: boolean;
  Icon: IconType;
  title: string;
  href: string;
}) => {
  return (
    <Link
      href={href}
      className={`flex items-center justify-start gap-2 w-full rounded px-2 py-1.5 text-sm transition-[box-shadow,background-color,color] ${
        selected
          ? "bg-white text-stone-950 shadow"
          : "hover:bg-stone-200 bg-transparent text-stone-500 shadow-none"
      }`}
    >
      <Icon className={selected ? "text-violet-500" : ""} />
      <span>{title}</span>
    </Link>
  );
};
