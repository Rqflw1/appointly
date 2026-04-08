import PartnersTable from "@/app/_components/partner/PartnersTable";
import { getDictionary } from "@/app/_lib/functions/general";
import { getCompanyFromCookies } from "@/app/_lib/serverFunctions/company";
import { getSessionAndUser } from "@/app/_lib/serverFunctions/auth";
import { prisma } from "@/app/_lib/constants/prisma";
import { notFound, redirect } from "next/navigation";
import { hasPermission } from "@/app/_lib/serverFunctions/permissions";
import { Permission } from "@/app/_prisma/enums";

export default async function PartnersPage() {
  const { user } = await getSessionAndUser();
  if (!user) redirect("/sign-in");

  const company = await getCompanyFromCookies(user);
  if (!company) redirect("/companies");

  if (!(await hasPermission(user, company.id, Permission.DOCUMENT_READ)))
    notFound();

  const partners = await prisma.company.findMany({
    where: { partnerId: company.id },
    orderBy: { createdAt: "asc" }
  });

  return (
    <main className="max-w-8xl mx-auto px-4 pt-8 pb-24">
      <PartnersTable partners={partners} />
    </main>
  );
}
