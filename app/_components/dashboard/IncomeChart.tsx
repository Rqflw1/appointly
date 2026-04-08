"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface ChartPoint {
  date: string;
  amount: number;
}

interface ComponentProps {
  data: ChartPoint[];
  title?: string;
}

export default function IncomeChart({ data, title }: ComponentProps) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-4 text-sm font-medium">
        {title || "Income (last 7 days)"}
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
