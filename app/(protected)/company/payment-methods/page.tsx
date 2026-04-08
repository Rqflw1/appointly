import PaymentMethodsTable from "@/app/_components/paymentMethod/PaymentMethodsTable";
import SettingsNav from "@/app/_components/company/SettingsNav";
import { getCompanyFromCookies } from "@/app/_lib/serverFunctions/company";
import { getSessionAndUser } from "@/app/_lib/serverFunctions/auth";
import { prisma } from "@/app/_lib/constants/prisma";
import { notFound, redirect } from "next/navigation";
import { hasPermission } from "@/app/_lib/serverFunctions/permissions";
import { Permission } from "@/app/_prisma/enums";

export default async function PaymentMethodsPage() {
  const { user } = await getSessionAndUser();
  if (!user) redirect("/sign-in");

  const company = await getCompanyFromCookies(user);
  if (!company) redirect("/companies");

  if (
    !(await hasPermission(user, company.id, Permission.COMPANY_SETTINGS_READ))
  )
    notFound();

  const paymentMethods = await prisma.paymentMethod.findMany({
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
        <PaymentMethodsTable paymentMethods={paymentMethods} />
      </div>
    </main>
  );
}
