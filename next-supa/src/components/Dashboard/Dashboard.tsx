import React from "react";
import { TopBar } from "./TopBar";
import { Grid } from "./Grid";
import { LogOut } from "lucide-react";

export const Dashboard = () => {
  return (
    <div className="bg-white rounded-lg pb-4 shadow">
      <TopBar />
      <Grid />
      <div className="p-4 border-t">
        <p className="text-xs text-stone-500">
          Last updated: August 8th, 2023 at 10:00 AM
        
        </p>
      </div>
   
    </div>
  );
};