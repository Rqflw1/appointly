"use server";

import { prisma } from "@/app/_lib/constants/prisma";
import { logger } from "../constants/logger";
import { getResult } from "../functions/general";
import { getSessionAndUser } from "../serverFunctions/auth";
import { refresh } from "next/cache";
import { Permission } from "@/app/_prisma/enums";
import { hasPermission } from "../serverFunctions/permissions";
import { getCompanyFromCookies } from "../serverFunctions/company";
import { CreateItemModel } from "../validation/item";

export async function getItemsAction(search: string) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (!(await hasPermission(user, company.id, Permission.DOCUMENT_READ)))
      return getResult(false, 403);

    const items = await prisma.item.findMany({
      where: {
        companyId: company.id,
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } }
        ]
      }
    });

    return getResult(true, 0, items);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}

export async function createItemsAction(models: CreateItemModel[]) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (!(await hasPermission(user, company.id, Permission.DOCUMENT_WRITE)))
      return getResult(false, 403);

    await prisma.item.createMany({
      data: models.map((row) => {
        return {
          sku: row.sku,
          name: row.name,
          description: row.description,
          unit: row.unit,
          quantity: row.quantity || 1,
          currency: row.currency,
          basePrice: row.basePrice || 0,
          discountRate: row.discountRate || 0,
          discountValue: row.discountValue || 0,
          vatRate: isNaN(row.vatRate ?? NaN) ? null : row.vatRate,
          vatValue: row.vatValue || 0,
          netPrice: row.netPrice || 0,
          grossPrice: row.grossPrice || 0,
          baseTotal: row.baseTotal || 0,
          discountTotal: row.discountTotal || 0,
          netTotal: row.netTotal || 0,
          vatTotal: row.vatTotal || 0,
          grossTotal: row.grossTotal || 0,
          companyId: company.id
        };
      })
    });

    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function updateItemAction(id: string, model: CreateItemModel) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (!(await hasPermission(user, company.id, Permission.DOCUMENT_WRITE)))
      return getResult(false, 403);

    const { sku, name, description, unit, quantity, currency } = model;
    const { basePrice, discountRate, discountValue } = model;
    const { netPrice, vatRate, vatValue, grossPrice } = model;
    const { baseTotal, discountTotal } = model;
    const { netTotal, vatTotal, grossTotal } = model;

    const { count } = await prisma.item.updateMany({
      where: { id, companyId: company.id },
      data: {
        sku,
        name,
        description,
        unit,
        quantity: quantity || 1,
        currency,
        basePrice: basePrice || 0,
        discountRate: discountRate || 0,
        discountValue: discountValue || 0,
        vatRate: isNaN(vatRate ?? NaN) ? null : vatRate,
        vatValue: vatValue || 0,
        netPrice: netPrice || 0,
        grossPrice: grossPrice || 0,
        baseTotal: baseTotal || 0,
        discountTotal: discountTotal || 0,
        netTotal: netTotal || 0,
        vatTotal: vatTotal || 0,
        grossTotal: grossTotal || 0
      }
    });
    if (!count) return getResult(false, 403);
    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function deleteItemAction(id: string) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (!(await hasPermission(user, company.id, Permission.DOCUMENT_WRITE)))
      return getResult(false, 403);

    const { count } = await prisma.item.deleteMany({
      where: { id, companyId: company.id }
    });
    if (!count) return getResult(false, 403);
    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}
