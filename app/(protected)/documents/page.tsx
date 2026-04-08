import DocumentsNavBar from "@/app/_components/document/DocumentsNavBar";
import DocumentsTable from "@/app/_components/document/DocumentsTable";
import { getCompanyFromCookies } from "@/app/_lib/serverFunctions/company";
import { getSessionAndUser } from "@/app/_lib/serverFunctions/auth";
import { prisma } from "@/app/_lib/constants/prisma";
import { notFound, redirect } from "next/navigation";
import { hasPermission } from "@/app/_lib/serverFunctions/permissions";
import { Permission } from "@/app/_prisma/enums";

export default async function DocumentsPage() {
  const { user } = await getSessionAndUser();
  if (!user) redirect("/sign-in");

  const company = await getCompanyFromCookies(user);
  if (!company) redirect("/companies");

  if (!(await hasPermission(user, company.id, Permission.DOCUMENT_READ)))
    notFound();

  const documents = await prisma.document.findMany({
    where: { companyId: company.id },
    include: { recipient: true, supplier: true },
    orderBy: { docDate: "desc" }
  });

  return (
    <main className="max-w-8xl mx-auto px-4 pt-8 pb-24">
      <DocumentsNavBar />
      <div className="mt-8">
        <DocumentsTable company={company} documents={documents} />
      </div>
    </main>
  );
}
