import { ReactNode } from "react";

interface ComponentProps {
  title: string;
  value: ReactNode;
  subtitle?: string;
}

export default function StatCard({ title, value, subtitle }: ComponentProps) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {subtitle ? (
        <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
      ) : null}
    </div>
  );
}
