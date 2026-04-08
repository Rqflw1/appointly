import { ReactNode } from "react";
import { protectedRoute } from "@/app/_lib/serverFunctions/auth";
import Shell from "@/app/_components/layout/Shell";
import Sidebar from "@/app/_components/layout/Sidebar";
import Topbar from "@/app/_components/layout/Topbar";
import { Toaster } from "@/app/_shadcn/components/ui/sonner";
import { User } from "@/app/_prisma/client";
import { getCsrfToken } from "@/app/_lib/serverFunctions/csrf";
import LocaleProvider from "@/app/_components/context/LocaleProvider";
import { cookies } from "next/headers";
import { Language } from "@/app/_prisma/enums";

interface ComponentProps {
  children: ReactNode;
  user: User;
}

export default protectedRoute(Layout);
async function Layout({ children, user }: ComponentProps) {
  const csrfToken = await getCsrfToken();
  const store = await cookies();
  const cookieLang = store.get("language")?.value as Language | undefined;
  const activeLanguage = cookieLang || user.language;
  return (
    <LocaleProvider language={activeLanguage}>
      <Shell
        sidebar={<Sidebar role={user.role} />}
        topbar={<Topbar user={user} language={activeLanguage} csrfToken={csrfToken} />}
      >
        {children}
        <Toaster />
      </Shell>
    </LocaleProvider>
  );
}
