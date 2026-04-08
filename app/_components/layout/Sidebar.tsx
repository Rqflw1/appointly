"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/_shadcn/lib/utils";
import { UserRole } from "@/app/_prisma/enums";
import { useContext } from "react";
import { LocaleContext } from "@/app/_components/context/LocaleProvider";

const nav = [
  { href: "/dashboard", labelKey: "dashboard", label: "Dashboard" },
  { href: "/clients", labelKey: "clients", label: "Clients" },
  { href: "/services", labelKey: "services", label: "Services" },
  { href: "/appointments", labelKey: "appointments", label: "Appointments" },
  { href: "/calendar", labelKey: "calendar", label: "Calendar" },
  { href: "/payments", labelKey: "payments", label: "Payments" },
  { href: "/reports", labelKey: "reports", label: "Reports" },
  { href: "/reminders", labelKey: "reminders", label: "Reminders" },
  { href: "/users", labelKey: "users", label: "Users", role: UserRole.ADMIN },
  { href: "/audit-log", labelKey: "auditLog", label: "Audit log", role: UserRole.ADMIN },
  { href: "/profile", labelKey: "profile", label: "Profile" }
];

interface ComponentProps {
  role?: UserRole;
}

export default function Sidebar({ role }: ComponentProps) {
  const pathname = usePathname();
  const { dict } = useContext(LocaleContext);

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-background/80 backdrop-blur">
      <div className="border-b border-border px-6 py-5">
        <div className="text-lg font-semibold">Mini CRM</div>
        <div className="text-xs text-muted-foreground">Billing & Scheduling</div>
      </div>
      <nav className="px-3 py-4 space-y-1">
        {nav
          .filter((item) => !item.role || item.role === role)
          .map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const label =
            (dict.labels as any)[item.labelKey as keyof typeof dict.labels] ||
            item.label;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/80 hover:bg-muted"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
