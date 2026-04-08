"use server";

import { prisma } from "@/app/_lib/constants/prisma";
import { logger } from "../constants/logger";
import { getResult } from "../functions/general";
import { CreatePaymentMethodModel } from "../types/paymentMethod";
import { getSessionAndUser } from "../serverFunctions/auth";
import { refresh } from "next/cache";
import { Permission } from "@/app/_prisma/enums";
import { hasPermission } from "../serverFunctions/permissions";
import { getCompanyFromCookies } from "../serverFunctions/company";
import { PaymentMethodWhereInput } from "@/app/_prisma/models";

export async function getPaymentMethodsAction(
  isPartner: boolean,
  partnerRegNum: string,
  search: string
) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (!(await hasPermission(user, company.id, Permission.DOCUMENT_READ)))
      return getResult(false, 403);

    const where: PaymentMethodWhereInput = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { accNum: { contains: search, mode: "insensitive" } }
      ]
    };

    if (isPartner)
      where.company = { partnerId: company.id, regNum: partnerRegNum };
    else where.companyId = company.id;

    const paymentMethods = await prisma.paymentMethod.findMany({ where });

    return getResult(true, 0, paymentMethods);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}

export async function createPaymentMethodAction(
  model: CreatePaymentMethodModel
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

    const { type, name, accNum, note, showByDefault, field_1 } = model;

    await prisma.paymentMethod.create({
      data: {
        type,
        name,
        accNum,
        note,
        showByDefault,
        field_1,
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

export async function updatePaymentMethodAction(
  id: string,
  model: CreatePaymentMethodModel
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

    const { type, name, accNum, note, showByDefault, field_1 } = model;

    const { count } = await prisma.paymentMethod.updateMany({
      where: { id, companyId: company.id },
      data: { type, name, accNum, note, showByDefault, field_1 }
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

export async function deletePaymentMethodAction(id: string) {
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

    const { count } = await prisma.paymentMethod.deleteMany({
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
