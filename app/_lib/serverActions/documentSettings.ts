"use server";

import { prisma } from "@/app/_lib/constants/prisma";
import { logger } from "../constants/logger";
import { getResult } from "../functions/general";
import { CreateDocumentSettingsModel } from "../types/documentSettings";
import { DocumentType, Permission } from "@/app/_prisma/enums";
import { getSessionAndUser } from "../serverFunctions/auth";
import { refresh } from "next/cache";
import { hasPermission } from "../serverFunctions/permissions";
import { getCompanyFromCookies } from "../serverFunctions/company";

export async function getDocumentSettingsAction(type: DocumentType) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (
      !(await hasPermission(user, company.id, Permission.COMPANY_SETTINGS_READ))
    )
      return getResult(false, 403);

    const documentSettings = await prisma.documentSettings.findFirst({
      where: { companyId: company.id, type }
    });

    return getResult(true, 0, documentSettings);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}

export async function upsertDocumentSettingsAction(
  model: CreateDocumentSettingsModel
) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (
      !(await hasPermission(
        user,
        company.id,
        Permission.COMPANY_SETTINGS_WRITE
      ))
    )
      return getResult(false, 403);

    const { type, docNum, indexRefreshRate, note } = model;
    let { index } = model;

    index = isNaN(index) ? 1 : index;

    await prisma.documentSettings.upsert({
      where: { companyId_type: { type, companyId: company.id } },
      update: { docNum, indexRefreshRate, index, note },
      create: {
        type,
        docNum,
        indexRefreshRate,
        index,
        note,
        lastRefresh: new Date(),
        companyId: company.id
      }
    });

    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}
