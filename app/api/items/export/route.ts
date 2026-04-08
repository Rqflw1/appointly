import { logger } from "@/app/_lib/constants/logger";
import { prisma } from "@/app/_lib/constants/prisma";
import { getResult } from "@/app/_lib/functions/general";
import { getSessionAndUser } from "@/app/_lib/serverFunctions/auth";
import { getCompanyFromCookies } from "@/app/_lib/serverFunctions/company";
import { hasPermission } from "@/app/_lib/serverFunctions/permissions";
import { ExportRecordsModelSchema } from "@/app/_lib/validation/general";
import { Permission } from "@/app/_prisma/enums";
import { ItemWhereInput } from "@/app/_prisma/models";
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

    const where: ItemWhereInput = { companyId: company.id };
    if (ids) where.id = { in: ids };

    const items = await prisma.item.findMany({
      where,
      orderBy: { name: "asc" },
      omit: {
        id: true,
        createdAt: true,
        updatedAt: true,
        documentId: true,
        companyId: true
      }
    });

    const json = JSON.stringify(items);
    const headers = new Headers({
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="items.json"'
    });

    return new NextResponse(json, { status: 200, headers });
  } catch (error) {
    logger.error(error);
    return NextResponse.json(getResult(false, 500), { status: 400 });
  }
}
