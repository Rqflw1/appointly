import EmailSettings from "@/app/_components/company/EmailSettings";
import SettingsNav from "@/app/_components/company/SettingsNav";
import { getCompanyFromCookies } from "@/app/_lib/serverFunctions/company";
import { getSessionAndUser } from "@/app/_lib/serverFunctions/auth";
import { EmailSettingsDict } from "@/app/_lib/types/emailSettings";
import { prisma } from "@/app/_lib/constants/prisma";
import { notFound, redirect } from "next/navigation";
import { DocumentType, Permission } from "@/app/_prisma/enums";
import { hasPermission } from "@/app/_lib/serverFunctions/permissions";
import { decryptData } from "@/app/_lib/serverFunctions/crypto";

export default async function EmailSettingsPage() {
  const { user } = await getSessionAndUser();
  if (!user) redirect("/sign-in");

  const company = await getCompanyFromCookies(user);
  if (!company) redirect("/companies");

  if (
    !(await hasPermission(user, company.id, Permission.COMPANY_SETTINGS_READ))
  )
    notFound();

  const emailSettingsArr = await prisma.emailSettings.findMany({
    where: { companyId: company.id }
  });

  const emailSettingsDict: EmailSettingsDict = {
    [DocumentType.INVOICE]: null,
    [DocumentType.WAYBILL]: null,
    [DocumentType.PREPAYMENT]: null,
    [DocumentType.DEBIT_NOTE]: null
  };

  emailSettingsArr.forEach(
    (settings) => (emailSettingsDict[settings.type] = settings)
  );

  const smtpPassword =
    company.smtpPassword.length && company.smtpPasswordDek.length
      ? decryptData(
          Buffer.from(company.smtpPassword),
          Buffer.from(company.smtpPasswordDek)
        )
      : "";

  return (
    <main className="max-w-8xl mx-auto px-4 pt-8 pb-24">
      <div className="text-3xl font-semibold">{company.name}</div>
      <div className="mt-8">
        <SettingsNav />
      </div>
      <div className="mt-8">
        <EmailSettings
          company={company}
          smtpPassword={smtpPassword}
          emailSettingsDict={emailSettingsDict}
        />
      </div>
    </main>
  );
}
