import DocumentSettings from "@/app/_components/company/DocumentSettings";
import SettingsNav from "@/app/_components/company/SettingsNav";
import { getSessionAndUser } from "@/app/_lib/serverFunctions/auth";
import { getCompanyFromCookies } from "@/app/_lib/serverFunctions/company";
import { DocumentSettingsDict } from "@/app/_lib/types/documentSettings";
import { prisma } from "@/app/_lib/constants/prisma";
import { notFound, redirect } from "next/navigation";
import { DocumentType, Permission } from "@/app/_prisma/enums";
import { hasPermission } from "@/app/_lib/serverFunctions/permissions";

export default async function DocumentSettingsPage() {
  const { user } = await getSessionAndUser();
  if (!user) redirect("/sign-in");

  const company = await getCompanyFromCookies(user);
  if (!company) redirect("/companies");

  if (
    !(await hasPermission(user, company.id, Permission.COMPANY_SETTINGS_READ))
  )
    notFound();

  const documentSettingsArr = await prisma.documentSettings.findMany({
    where: { companyId: company.id }
  });
  const units = await prisma.unit.findMany({
    where: { companyId: company.id }
  });

  const documentSettingsDict: DocumentSettingsDict = {
    [DocumentType.INVOICE]: null,
    [DocumentType.WAYBILL]: null,
    [DocumentType.PREPAYMENT]: null,
    [DocumentType.DEBIT_NOTE]: null
  };

  documentSettingsArr.forEach(
    (settings) => (documentSettingsDict[settings.type] = settings)
  );

  return (
    <main className="max-w-8xl mx-auto px-4 pt-8 pb-24">
      <div className="text-3xl font-semibold">{company.name}</div>
      <div className="mt-8">
        <SettingsNav />
      </div>
      <div className="mt-8">
        <DocumentSettings
          company={company}
          documentSettingsDict={documentSettingsDict}
          units={units}
        />
      </div>
    </main>
  );
}
