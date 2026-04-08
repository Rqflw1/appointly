import { logger } from "@/app/_lib/constants/logger";
import { getParam, getResult } from "@/app/_lib/functions/general";
import { generatePeppolXml } from "@/app/_lib/functions/peppol";
import { getSessionAndUser } from "@/app/_lib/serverFunctions/auth";
import { prisma } from "@/app/_lib/constants/prisma";
import { NextRequest, NextResponse } from "next/server";
import { DocumentEventType, Permission } from "@/app/_prisma/enums";
import { hasPermission } from "@/app/_lib/serverFunctions/permissions";
import { getDocumentFilename } from "@/app/_lib/functions/document";
import { createDocumentEvent } from "@/app/_lib/serverFunctions/documentEvents";

interface ParamsObject {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function GET(req: NextRequest, { params }: ParamsObject) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return NextResponse.json(null, { status: 401 });

    const documentId = getParam(await params, "documentId").at(0) || "";
    const document = await prisma.document.findFirst({
      where: { id: documentId },
      include: {
        supplier: { include: { paymentMethods: true } },
        recipient: { include: { paymentMethods: true } },
        items: true,
        fromDocuments: { include: { fromDocument: true } },
        company: true
      }
    });
    if (!document)
      return NextResponse.json(getResult(false, 1), { status: 404 });

    if (
      !(await hasPermission(user, document.companyId, Permission.DOCUMENT_READ))
    )
      return NextResponse.json(null, { status: 403 });

    const xml = generatePeppolXml(document);
    const bytes = new TextEncoder().encode(xml);

    const filename = getDocumentFilename(document, "xml");
    const headers = new Headers({
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/octet-stream",
      "Content-Length": `${bytes.length}`
    });

    await createDocumentEvent({
      documentId: document.id,
      userId: user.id,
      type: DocumentEventType.DOWNLOAD
    });

    return new NextResponse(bytes, { status: 200, headers });
  } catch (error) {
    logger.error(error);
    return NextResponse.json(getResult(false, 500), { status: 400 });
  }
}
