import CopyOrEditDocumentForm from "@/app/_components/document/CopyOrEditDocumentForm";
import { getParam } from "@/app/_lib/functions/general";
import { getLogoUrlAction } from "@/app/_lib/serverActions/logo";
import { getCompanyFromCookies } from "@/app/_lib/serverFunctions/company";
import { getSessionAndUser } from "@/app/_lib/serverFunctions/auth";
import { LogoWithUrl } from "@/app/_lib/types/logo";
import { prisma } from "@/app/_lib/constants/prisma";
import { notFound, redirect } from "next/navigation";
import { hasPermission } from "@/app/_lib/serverFunctions/permissions";
import { Permission } from "@/app/_prisma/enums";

interface ComponentProps {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CopyDocumentPage({ params }: ComponentProps) {
  const { user } = await getSessionAndUser();
  if (!user) redirect("/sign-in");

  const company = await getCompanyFromCookies(user);
  if (!company) redirect("/companies");

  if (!(await hasPermission(user, company.id, Permission.DOCUMENT_WRITE)))
    notFound();

  const documentId = getParam(await params, "id").at(0) || "";

  const document = await prisma.document.findFirst({
    where: { id: documentId },
    include: {
      logo: true,
      supplier: { include: { paymentMethods: true } },
      recipient: { include: { paymentMethods: true } },
      items: true,
      fromDocuments: { include: { fromDocument: true } },
      company: true
    }
  });

  if (!document) notFound();

  const documentLogoWithUrl: LogoWithUrl | null = document.logo
    ? { ...document.logo, url: "" }
    : null;

  if (documentLogoWithUrl)
    documentLogoWithUrl.url =
      (await getLogoUrlAction(documentLogoWithUrl.id)).data || "";

  const companyLogo = await prisma.logo.findFirst({
    where: { companyId: company.id }
  });
  const companyLogoWithUrl: LogoWithUrl | null = companyLogo
    ? { ...companyLogo, url: "" }
    : null;
  if (companyLogoWithUrl)
    companyLogoWithUrl.url =
      (await getLogoUrlAction(companyLogoWithUrl.id)).data || "";

  const units = await prisma.unit.findMany({
    where: { companyId: company.id }
  });

  return (
    <main className="max-w-5xl mx-auto px-4 pt-8 pb-24">
      <CopyOrEditDocumentForm
        isCopy
        company={company}
        companyLogo={companyLogoWithUrl}
        document={document}
        documentLogo={documentLogoWithUrl}
        units={units}
        documentEvents={[]}
      />
    </main>
  );
}
