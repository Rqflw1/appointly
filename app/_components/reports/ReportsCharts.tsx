"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface IncomePoint {
  date: string;
  amount: number;
}

interface MethodPoint {
  name: string;
  value: number;
}

interface ComponentProps {
  income: IncomePoint[];
  methods: MethodPoint[];
}

const COLORS = ["#6366f1", "#22c55e", "#f97316", "#ef4444"];

export default function ReportsCharts({ income, methods }: ComponentProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border bg-white p-4">
        <div className="mb-3 text-sm font-medium">Income by day</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={income}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border bg-white p-4">
        <div className="mb-3 text-sm font-medium">Payment methods</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={methods} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                {methods.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
