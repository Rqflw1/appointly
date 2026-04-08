import { logger } from "@/app/_lib/constants/logger";
import { prisma } from "@/app/_lib/constants/prisma";
import { getResult } from "@/app/_lib/functions/general";
import { getSessionAndUser } from "@/app/_lib/serverFunctions/auth";
import { getCompanyFromCookies } from "@/app/_lib/serverFunctions/company";
import { hasPermission } from "@/app/_lib/serverFunctions/permissions";
import { ExportRecordsModelSchema } from "@/app/_lib/validation/general";
import { Permission } from "@/app/_prisma/enums";
import { CompanyWhereInput } from "@/app/_prisma/models";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return NextResponse.json(null, { status: 401 });

    const company = await getCompanyFromCookies(user);
    if (!company) return NextResponse.json(null, { status: 403 });

    if (!(await hasPermission(user, company.id, Permission.DOCUMENT_READ)))
      return NextResponse.json(null, { status: 403 });

    const data = await req.json();
    const zRes = ExportRecordsModelSchema.safeParse(data);
    if (!zRes.success)
      return NextResponse.json(getResult(false, 400), { status: 400 });

    const { ids } = zRes.data;

    const where: CompanyWhereInput = { partnerId: company.id };
    if (ids) where.id = { in: ids };

    const partners = await prisma.company.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        paymentMethods: {
          omit: {
            id: true,
            createdAt: true,
            updatedAt: true,
            companyId: true
          }
        }
      },
      omit: {
        id: true,
        createdAt: true,
        updatedAt: true,
        partnerId: true,
        smtpHost: true,
        smtpUser: true,
        smtpPassword: true,
        smtpPasswordDek: true
      }
    });

    const json = JSON.stringify(partners);
    const headers = new Headers({
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="partners.json"'
    });

    return new NextResponse(json, { status: 200, headers });
  } catch (error) {
    logger.error(error);
    return NextResponse.json(getResult(false, 500), { status: 400 });
  }
}
