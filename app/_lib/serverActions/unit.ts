"use server";

import { prisma } from "@/app/_lib/constants/prisma";
import { logger } from "../constants/logger";
import { getResult } from "../functions/general";
import { getSessionAndUser } from "../serverFunctions/auth";
import { refresh } from "next/cache";
import { CreateUnitModel } from "../types/unit";
import { Permission } from "@/app/_prisma/enums";
import { hasPermission } from "../serverFunctions/permissions";
import { getCompanyFromCookies } from "../serverFunctions/company";

export async function createUnitAction(model: CreateUnitModel) {
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

    const { name, description } = model;

    await prisma.unit.create({
      data: { name, description, companyId: company.id }
    });
    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function updateUnitAction(id: string, model: CreateUnitModel) {
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

    const { name, description } = model;

    const { count } = await prisma.unit.updateMany({
      where: { id, companyId: company.id },
      data: { name, description }
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

export async function deleteUnitAction(id: string) {
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

    const { count } = await prisma.unit.deleteMany({
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
