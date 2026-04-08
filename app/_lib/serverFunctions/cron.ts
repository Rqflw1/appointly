import "server-only";

import {
  EXCHANGE_API_KEY,
  EXCHANGE_API_URL,
  SCW_BUCKET
} from "../constants/general";
import { ExchangeRateApiResponseSchema } from "../validation/general";
import { prisma } from "@/app/_lib/constants/prisma";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/scaleway/s3";
import { logger } from "../constants/logger";
import { DocumentType, IndexRefreshRate } from "@/app/_prisma/enums";

export function deleteUnreferenced() {
  deleteUnreferencedLogos();
  deleteUnreferencedCompanies();
}

export function deleteExpired() {
  deleteExpiredInvitations();
}

export async function resetDocumentIndexes() {
  try {
    const settings = await prisma.documentSettings.findMany();
    const now = new Date();
    const ids: { companyId: string; type: DocumentType }[] = [];

    settings.forEach((setting) => {
      const { companyId, type, indexRefreshRate, lastRefresh } = setting;

      if (indexRefreshRate === IndexRefreshRate.NEVER) return;

      if (
        (indexRefreshRate === IndexRefreshRate.DAY &&
          (lastRefresh.getDate() !== now.getDate() ||
            lastRefresh.getMonth() !== now.getMonth() ||
            lastRefresh.getFullYear() !== now.getFullYear())) ||
        (indexRefreshRate === IndexRefreshRate.MONTH &&
          (lastRefresh.getMonth() !== now.getMonth() ||
            lastRefresh.getFullYear() !== now.getFullYear())) ||
        (indexRefreshRate === IndexRefreshRate.YEAR &&
          lastRefresh.getFullYear() !== now.getFullYear())
      )
        ids.push({ companyId: companyId, type });
    });

    await prisma.documentSettings.updateMany({
      where: { OR: ids.map(({ companyId, type }) => ({ companyId, type })) },
      data: { index: 1, lastRefresh: now }
    });

    logger.info("Document indexes reset successfully");
  } catch (error) {
    logger.error(error);
  }
}

export async function fetchAndSaveCurrencyRates() {
  try {
    const res = await fetch(
      `${EXCHANGE_API_URL}/v6/${EXCHANGE_API_KEY}/latest/EUR`
    );
    const body = await res.json();

    const zRes = ExchangeRateApiResponseSchema.safeParse(body);
    if (!zRes.success) return;

    await prisma.$transaction([
      prisma.currencyRate.deleteMany({
        where: { code: { notIn: Object.keys(zRes.data.conversion_rates) } }
      }),
      ...Object.entries(zRes.data.conversion_rates).map(([code, rate]) =>
        prisma.currencyRate.upsert({
          where: { code },
          update: { rate },
          create: { code, rate }
        })
      )
    ]);
  } catch (error) {
    logger.error(error);
  }
}

// ----------------------------------------------------------------------------

async function deleteUnreferencedLogos() {
  try {
    const logos = await prisma.logo.findMany({
      where: { companyId: null, documents: { none: {} } }
    });
    const { count } = await prisma.logo.deleteMany({
      where: { id: { in: logos.map(({ id }) => id) } }
    });

    const keys = logos.map(({ id }) => `logos/logo-${id}`);
    let startIndex = 0;
    const length = 500;
    while (startIndex < keys.length) {
      const Objects = keys
        .slice(startIndex, startIndex + length)
        .map((key) => ({ Key: key }));
      startIndex = startIndex + length;
      const command = new DeleteObjectsCommand({
        Bucket: SCW_BUCKET,
        Delete: { Objects }
      });
      await s3.send(command);
    }
    logger.info(`Unreferenced logos deleted: ${count}`);
  } catch (error) {
    logger.error(error);
  }
}

async function deleteUnreferencedCompanies() {
  try {
    const { count } = await prisma.company.deleteMany({
      where: {
        partnerId: null,
        users: { none: {} },
        documentAsSupplier: { is: null },
        documentAsRecipient: { is: null }
      }
    });

    logger.info(`Unreferenced companies deleted: ${count}`);
  } catch (error) {
    logger.error(error);
  }
}

async function deleteExpiredInvitations() {
  try {
    const date = new Date();
    date.setDate(date.getDate() - 1);

    const { count } = await prisma.invitation.deleteMany({
      where: { createdAt: { lte: date } }
    });

    logger.info(`Expired invitations deleted: ${count}`);
  } catch (error) {
    logger.error(error);
  }
}
