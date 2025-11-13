import React from "react";
import { TopBar } from "./TopBar";
import { Grid } from "./Grid";

export const Dashboard = () => {
  return (
    <div className="bg-white p-0 m-0 rounded-lg shadow">
      <TopBar />
      <div className="p-3 sm:p-4 lg:p-6">
        <Grid />
      </div>
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-t">
        <p className="text-xs text-stone-500">
          Last updated: August 8th, 2023 at 10:00 AM
        </p>
      </div>
    </div>
  );
};