"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/_shadcn/lib/utils";
import { UserRole } from "@/app/_prisma/enums";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
  { href: "/services", label: "Services" },
  { href: "/appointments", label: "Appointments" },
  { href: "/calendar", label: "Calendar" },
  { href: "/payments", label: "Payments" },
  { href: "/reports", label: "Reports" },
  { href: "/reminders", label: "Reminders" },
  { href: "/users", label: "Users", role: UserRole.ADMIN },
  { href: "/audit-log", label: "Audit log", role: UserRole.ADMIN },
  { href: "/profile", label: "Profile" }
];

interface ComponentProps {
  role?: UserRole;
}

export default function Sidebar({ role }: ComponentProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r bg-white/70 backdrop-blur">
      <div className="px-6 py-5 border-b">
        <div className="text-lg font-semibold">Mini CRM</div>
        <div className="text-xs text-muted-foreground">Billing & Scheduling</div>
      </div>
      <nav className="px-3 py-4 space-y-1">
        {nav
          .filter((item) => !item.role || item.role === role)
          .map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
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
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
