"use client";

import React from "react";
import { StatCards } from "./StatCards";
import { ActivityGraph } from "./ActivityGraph";
import { UsageRadar } from "./UsageRadar";
import { RecentTransactions } from "./RecentTransactions";

export const Grid = () => {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-12">
      <StatCards />
      <ActivityGraph />
      <UsageRadar />
      <RecentTransactions />
    </div>
  );
};