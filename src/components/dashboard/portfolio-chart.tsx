"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Fund {
  fundCode: string;
  fundName: string;
  totalCost: number;
  marketValue: number;
}

export function PortfolioChart({ funds }: { funds: Fund[] }) {
  const data = funds.map((f) => ({
    name: f.fundCode,
    "Cost Value": Math.round(f.totalCost),
    "Market Value": Math.round(f.marketValue),
  }));

  if (data.length === 0) {
    return <p className="text-[#999] text-sm text-center py-10">No data available</p>;
  }

  const formatValue = (value: number) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={8}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8ecef" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6c757d" }} />
        <YAxis tickFormatter={formatValue} tick={{ fontSize: 11, fill: "#6c757d" }} />
        <Tooltip
          formatter={(value: any) => `৳${Number(value).toLocaleString("en-IN")}`}
          contentStyle={{ borderRadius: "12px", border: "1px solid #e8ecef", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}
        />
        <Legend />
        <Bar dataKey="Cost Value" fill="#d1d5db" radius={[6, 6, 0, 0]} />
        <Bar dataKey="Market Value" fill="#F27023" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
