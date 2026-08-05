"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatNaira } from "@/lib/utils";

export function RevenueChart({ data }: { data: { date: string; revenueKobo: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0078f0" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#0078f0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e8ef" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#5b6472" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#5b6472" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₦${(v / 100000).toFixed(0)}k`}
          width={48}
        />
        <Tooltip
          formatter={(value) => [formatNaira(Number(value) || 0, { withDecimals: false }), "Revenue"]}
          contentStyle={{ borderRadius: 12, border: "1px solid #e4e8ef", fontSize: 12 }}
        />
        <Area type="monotone" dataKey="revenueKobo" stroke="#0078f0" strokeWidth={2.5} fill="url(#revenueFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
