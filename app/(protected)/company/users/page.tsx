import SettingsNav from "@/app/_components/company/SettingsNav";
import UsersSettings from "@/app/_components/company/UserSettings";
import { getCompanyFromCookies } from "@/app/_lib/serverFunctions/company";
import { getSessionAndUser } from "@/app/_lib/serverFunctions/auth";
import { prisma } from "@/app/_lib/constants/prisma";
import { redirect } from "next/navigation";

export default async function CompanyUsersPage() {
  const { user } = await getSessionAndUser();
  if (!user) redirect("/sign-in");

  const company = await getCompanyFromCookies(user);
  if (!company) redirect("/companies");

  const users = (
    await prisma.companyUser.findMany({
      where: { companyId: company.id },
      include: { user: true },
      orderBy: { createdAt: "asc" }
    })
  ).map(({ user, role }) => ({ ...user, role }));

  const invitations = await prisma.invitation.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "asc" }
  });

  return (
    <main className="max-w-8xl mx-auto px-4 pt-8 pb-24">
      <div className="text-3xl font-semibold">{company.name}</div>
      <div className="mt-8">
        <SettingsNav />
      </div>
      <div className="mt-8">
        <UsersSettings users={users} invitations={invitations} />
      </div>
    </main>
  );
}
