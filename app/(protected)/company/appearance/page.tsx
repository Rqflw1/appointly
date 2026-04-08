import AppearanceForm from "@/app/_components/company/AppearanceForm";
import SettingsNav from "@/app/_components/company/SettingsNav";
import { prisma } from "@/app/_lib/constants/prisma";
import { getLogoUrlAction } from "@/app/_lib/serverActions/logo";
import { getSessionAndUser } from "@/app/_lib/serverFunctions/auth";
import { getCompanyFromCookies } from "@/app/_lib/serverFunctions/company";
import { hasPermission } from "@/app/_lib/serverFunctions/permissions";
import { LogoWithUrl } from "@/app/_lib/types/logo";
import { Permission } from "@/app/_prisma/enums";
import { notFound, redirect } from "next/navigation";

export default async function AppearancePage() {
  const { user } = await getSessionAndUser();
  if (!user) redirect("/sign-in");

  const company = await getCompanyFromCookies(user);
  if (!company) redirect("/companies");

  if (
    !(await hasPermission(user, company.id, Permission.COMPANY_SETTINGS_READ))
  )
    notFound();

  const logo = await prisma.logo.findFirst({
    where: { companyId: company.id }
  });

  const logoWithUrl: LogoWithUrl | null = logo ? { ...logo, url: "" } : null;

  if (logoWithUrl)
    logoWithUrl.url = (await getLogoUrlAction(logoWithUrl.id)).data || "";

  return (
    <main className="max-w-8xl mx-auto px-4 pt-8 pb-24">
      <div className="text-3xl font-semibold">{company.name}</div>
      <div className="mt-8">
        <SettingsNav />
      </div>
      <div className="mt-8">
        <AppearanceForm company={company} companyLogo={logoWithUrl} />
      </div>
    </main>
  );
}
