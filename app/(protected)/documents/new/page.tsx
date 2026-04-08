import NewDocumentForm from "@/app/_components/document/NewDocumentForm";
import { getParam } from "@/app/_lib/functions/general";
import { getLogoUrlAction } from "@/app/_lib/serverActions/logo";
import { getCompanyFromCookies } from "@/app/_lib/serverFunctions/company";
import { getSessionAndUser } from "@/app/_lib/serverFunctions/auth";
import { CompanyWithMethods } from "@/app/_lib/types/company";
import { LogoWithUrl } from "@/app/_lib/types/logo";
import { prisma } from "@/app/_lib/constants/prisma";
import { notFound, redirect } from "next/navigation";
import { hasPermission } from "@/app/_lib/serverFunctions/permissions";
import { Permission } from "@/app/_prisma/enums";

interface ComponentProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NewDocumentPage({
  searchParams
}: ComponentProps) {
  const { user } = await getSessionAndUser();
  if (!user) redirect("/sign-in");

  const company = await getCompanyFromCookies(user);
  if (!company) redirect("/companies");

  if (!(await hasPermission(user, company.id, Permission.DOCUMENT_WRITE)))
    notFound();

  const paymentMethods = await prisma.paymentMethod.findMany({
    where: { companyId: company.id }
  });
  const units = await prisma.unit.findMany({
    where: { companyId: company.id }
  });

  const partnerId = getParam(await searchParams, "partnerId").at(0) || "";
  const partner = await prisma.company.findFirst({
    where: { id: partnerId },
    include: { paymentMethods: true }
  });

  const logo = await prisma.logo.findFirst({
    where: { companyId: company.id }
  });
  const logoWithUrl: LogoWithUrl | null = logo ? { ...logo, url: "" } : null;
  if (logoWithUrl)
    logoWithUrl.url = (await getLogoUrlAction(logoWithUrl.id)).data || "";

  return (
    <main className="max-w-5xl mx-auto px-4 pt-8 pb-24">
      <NewDocumentForm
        company={company}
        paymentMethods={paymentMethods}
        companyLogo={logoWithUrl}
        partner={partner}
        units={units}
      />
    </main>
  );
}
