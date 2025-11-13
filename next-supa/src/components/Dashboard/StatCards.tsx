import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

export const StatCards = () => {
  return (
    <>
      <Card
        title="Gross Revenue"
        value="$120,054.24"
        pillText="2.75%"
        trend="up"
        period="From Jan 1st - Jul 31st"
      />
      <Card
        title="Avg Order"
        value="$27.97"
        pillText="1.01%"
        trend="down"
        period="From Jan 1st - Jul 31st"
      />
      <Card
        title="Trailing Year"
        value="$278,054.24"
        pillText="60.75%"
        trend="up"
        period="Previous 365 days"
      />
    </>
  );
};

const Card = ({
  title,
  value,
  pillText,
  trend,
  period,
}: {
  title: string;
  value: string;
  pillText: string;
  trend: "up" | "down";
  period: string;
}) => {
  return (
    <div className="col-span-12 sm:col-span-6 lg:col-span-4 p-4 rounded border border-stone-300 bg-white">
      <div className="flex mb-6 items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-stone-500 mb-2 text-sm">{title}</h3>
          <p className="text-2xl sm:text-3xl font-semibold break-words">{value}</p>
        </div>

        <span
          className={`text-xs flex items-center gap-1 font-medium px-2 py-1 rounded whitespace-nowrap flex-shrink-0 ${
            trend === "up"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {trend === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {pillText}
        </span>
      </div>

      <p className="text-xs text-stone-500">{period}</p>
    </div>
  );
};