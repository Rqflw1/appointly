"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/_shadcn/lib/utils";
import { UserRole } from "@/app/_prisma/enums";
import { useContext } from "react";
import { LocaleContext } from "@/app/_components/context/LocaleProvider";
import {
  LayoutGrid,
  Users,
  Briefcase,
  CalendarDays,
  Receipt,
  BarChart3,
  Bell,
  UserRound,
  ClipboardList
} from "lucide-react";

const nav = [
  { href: "/dashboard", labelKey: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/clients", labelKey: "clients", label: "Clients", icon: Users },
  { href: "/services", labelKey: "services", label: "Services", icon: Briefcase },
  { href: "/appointments", labelKey: "appointments", label: "Appointments", icon: CalendarDays },
  { href: "/calendar", labelKey: "calendar", label: "Calendar", icon: CalendarDays },
  { href: "/payments", labelKey: "payments", label: "Payments", icon: Receipt },
  { href: "/reports", labelKey: "reports", label: "Reports", icon: BarChart3 },
  { href: "/reminders", labelKey: "reminders", label: "Reminders", icon: Bell },
  { href: "/users", labelKey: "users", label: "Users", role: UserRole.ADMIN, icon: Users },
  { href: "/audit-log", labelKey: "auditLog", label: "Audit log", role: UserRole.ADMIN, icon: ClipboardList },
  { href: "/profile", labelKey: "profile", label: "Profile", icon: UserRound }
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
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/80 hover:bg-muted"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
