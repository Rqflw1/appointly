import { ReactNode } from "react";
import { publicRoute } from "@/app/_lib/serverFunctions/auth";

interface ComponentProps {
  children: ReactNode;
}

export default publicRoute(Layout);
async function Layout({ children }: ComponentProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mb-6">
            <div className="text-2xl font-semibold">Mini CRM</div>
            <div className="text-sm text-muted-foreground">
              Sign in to manage clients, bookings, and payments.
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
