"use client";

import React from "react";
import { ArrowUpRight, DollarSign, MoreHorizontal } from "lucide-react";

export const RecentTransactions = () => {
  const transactions = [
    { cusId: "#48149", sku: "Pro 1 Month", date: "Aug 2nd", price: "$9.75" },
    { cusId: "#1942s", sku: "Pro 3 Month", date: "Aug 2nd", price: "$21.25" },
    { cusId: "#4192", sku: "Pro 1 Year", date: "Aug 1st", price: "$94.75" },
    { cusId: "#99481", sku: "Pro 1 Month", date: "Aug 1st", price: "$9.44" },
    { cusId: "#1304", sku: "Pro 1 Month", date: "Aug 1st", price: "$9.23" },
    { cusId: "#1304", sku: "Pro 3 Month", date: "Jul 31st", price: "$22.02" },
  ];

  return (
    <div className="col-span-12 overflow-x-auto p-4 rounded border border-stone-300 bg-white">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="flex items-center gap-2 font-medium text-stone-700">
          <DollarSign size={18} /> Recent Transactions
        </h3>
        <button className="text-sm text-violet-500 hover:underline self-start sm:self-auto">
          See all
        </button>
      </div>

      {/* Table */}
      <table className="min-w-[600px] w-full table-auto border-collapse">
        <TableHead />
        <tbody>
          {transactions.map((tx, idx) => (
            <TableRow
              key={tx.cusId + idx}
              order={idx + 1}
              cusId={tx.cusId}
              sku={tx.sku}
              date={tx.date}
              price={tx.price}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TableHead = () => (
  <thead>
    <tr className="text-sm font-semibold text-stone-500 bg-stone-100">
      <th className="text-start p-2 rounded-tl">Customer ID</th>
      <th className="text-start p-2">SKU</th>
      <th className="text-start p-2">Date</th>
      <th className="text-start p-2">Price</th>
      <th className="w-8 rounded-tr"></th>
    </tr>
  </thead>
);

const TableRow = ({
  cusId,
  sku,
  date,
  price,
  order,
}: {
  cusId: string;
  sku: string;
  date: string;
  price: string;
  order: number;
}) => {
  return (
    <tr className={`text-sm ${order % 2 ? "bg-stone-50" : ""}`}>
      <td className="p-2">
        <a
          href="#"
          className="text-violet-600 underline flex items-center gap-1 hover:text-violet-800 w-fit"
        >
          {cusId} <ArrowUpRight size={14} />
        </a>
      </td>
      <td className="p-2">{sku}</td>
      <td className="p-2">{date}</td>
      <td className="p-2 font-medium">{price}</td>
      <td className="w-8">
        <button className="grid place-content-center p-1 rounded hover:bg-stone-200 transition">
          <MoreHorizontal size={16} />
        </button>
      </td>
    </tr>
  );
};
