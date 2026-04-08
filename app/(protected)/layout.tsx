import { ReactNode } from "react";
import {
  getSessionAndUser,
  protectedRoute,
  redirectWithReturnUrl
} from "../_lib/serverFunctions/auth";
import SignOutHelper from "../_components/auth/SignOutHelper";
import LocaleProvider from "../_components/context/LocaleProvider";
import UserHeader from "../_components/general/UserHeader";
import UserFooter from "../_components/general/UserFooter";
import { Toaster } from "../_shadcn/components/ui/sonner";
import { getDictionary } from "../_lib/functions/general";
import { getCompanyFromCookies } from "../_lib/serverFunctions/company";
import { prisma } from "../_lib/constants/prisma";
import { User } from "../_prisma/client";

interface ComponentProps {
  children: ReactNode;
  user: User;
}

export default protectedRoute(Layout);
async function Layout({ children, user }: ComponentProps) {
  const dict = getDictionary(user.language);

  const company = await getCompanyFromCookies(user);
  const companies = (
    await prisma.companyUser.findMany({
      where: { userId: user.id },
      include: { company: true }
    })
  ).map(({ company }) => company);

  return (
    <LocaleProvider language={user.language}>
      <div className="h-full flex flex-col">
        <UserHeader
          dict={dict}
          user={user}
          company={company}
          companies={companies}
        />
        {/* <TestStyle /> */}
        <div className="w-full">{children}</div>
        <div className="mt-auto">
          <UserFooter dict={dict} />
        </div>
        <Toaster />
      </div>
    </LocaleProvider>
  );
}
