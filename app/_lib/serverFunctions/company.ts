import "server-only";

import { cookies } from "next/headers";
import { prisma } from "@/app/_lib/constants/prisma";
import { User } from "@/app/_prisma/browser";
import { CookiesKey } from "../types/general";

export async function getCompanyFromCookies(user: User) {
  const cookieStore = await cookies();
  const companyId = cookieStore.get(CookiesKey.COMPANY_ID)?.value ?? "";

  const companyUser = await prisma.companyUser.findFirst({
    where: { userId: user.id, companyId },
    include: { company: true }
  });

  if (!companyUser) return null;

  return { ...companyUser.company, role: companyUser.role };
}
