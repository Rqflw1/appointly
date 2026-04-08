import ItemsTable from "@/app/_components/item/ItemsTable";
import { getDictionary } from "@/app/_lib/functions/general";
import { getCompanyFromCookies } from "@/app/_lib/serverFunctions/company";
import { getSessionAndUser } from "@/app/_lib/serverFunctions/auth";
import { prisma } from "@/app/_lib/constants/prisma";
import { notFound, redirect } from "next/navigation";
import { hasPermission } from "@/app/_lib/serverFunctions/permissions";
import { Permission } from "@/app/_prisma/enums";

export default async function ItemsPage() {
  const { user } = await getSessionAndUser();
  if (!user) redirect("/sign-in");

  const company = await getCompanyFromCookies(user);
  if (!company) redirect("/companies");

  if (!(await hasPermission(user, company.id, Permission.DOCUMENT_READ)))
    notFound();

  const items = await prisma.item.findMany({
    where: { companyId: company.id },
    orderBy: { name: "asc" }
  });
  const units = await prisma.unit.findMany({
    where: { companyId: company.id }
  });

  return (
    <main className="max-w-8xl mx-auto px-4 pt-8 pb-24">
      <ItemsTable company={company} items={items} units={units} />
    </main>
  );
}
