import { ReactNode } from "react";
import { publicRoute } from "@/app/_lib/serverFunctions/auth";
import LocaleProvider from "@/app/_components/context/LocaleProvider";
import { DEFAULT_LANGUAGE } from "@/app/_lib/constants/general";
import { cookies } from "next/headers";
import { Language } from "@/app/_prisma/enums";

interface ComponentProps {
  children: ReactNode;
}

export default publicRoute(Layout);
async function Layout({ children }: ComponentProps) {
  const store = await cookies();
  const cookieLang = store.get("language")?.value as Language | undefined;
  const activeLanguage = cookieLang || DEFAULT_LANGUAGE;
  return (
    <LocaleProvider language={activeLanguage}>
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
    </LocaleProvider>
  );
}
