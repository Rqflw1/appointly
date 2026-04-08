import CompaniesTable from "@/app/_components/company/CompaniesTable";
import { prisma } from "@/app/_lib/constants/prisma";
import { getParam } from "@/app/_lib/functions/general";
import { getSessionAndUser } from "@/app/_lib/serverFunctions/auth";
import { redirect } from "next/navigation";

interface ComponentProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CompaniesPage({ searchParams }: ComponentProps) {
  const { user } = await getSessionAndUser();
  if (!user) redirect("/sign-in");

  const addDialogIsOpen = getParam(await searchParams, "add").at(0) || "";

  const companies = (
    await prisma.companyUser.findMany({
      where: { userId: user.id },
      include: { company: true },
      orderBy: { createdAt: "asc" }
    })
  ).map(({ company, role }) => ({ ...company, role }));

  return (
    <main className="max-w-8xl mx-auto px-4 pt-8 pb-24">
      <CompaniesTable companies={companies} addDialogIsOpen={addDialogIsOpen} />
    </main>
  );
}
