import "server-only";

import { prisma } from "@/app/_lib/constants/prisma";
import { logger } from "@/app/_lib/constants/logger";
import { DocumentEventType } from "@/app/_prisma/enums";

interface CreateDocumentEventArgs {
  documentId: string;
  userId: string;
  type: DocumentEventType;
}

export async function createDocumentEvent({
  documentId,
  userId,
  type
}: CreateDocumentEventArgs) {
  try {
    await prisma.documentEvent.create({
      data: {
        documentEventType: type,
        document: { connect: { id: documentId } },
        user: { connect: { id: userId } }
      }
    });
  } catch (error) {
    logger.error(error);
  }
}
