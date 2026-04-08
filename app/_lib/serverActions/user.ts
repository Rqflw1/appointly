"use server";

import bcrypt from "bcrypt";
import { Permission, UserAccessLevel } from "@/app/_prisma/enums";
import { getResult } from "../functions/general";
import { prisma } from "@/app/_lib/constants/prisma";
import { logger } from "../constants/logger";
import { CODE_TTL } from "../constants/code";
import {
  ChangePasswordModel,
  DeleteUserModel,
  RecoverPasswordModel,
  UpdateUserModel
} from "../types/user";
import { getSessionAndUser } from "../serverFunctions/auth";
import { refresh } from "next/cache";
import { hasPermission } from "../serverFunctions/permissions";
import { CodeSchema, EmailSchema, PasswordSchema } from "../validation/general";
import { getCompanyFromCookies } from "../serverFunctions/company";

export async function updateUserAction(id: string, model: UpdateUserModel) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const { name, surname, email, language } = model;

    await prisma.user.update({
      where: { id },
      data: { name, surname, email, language }
    });

    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function changePasswordAction(model: ChangePasswordModel) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const { currentPassword, newPassword } = model;

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return getResult(false, 1);

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash }
    });

    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function changeRoleAction(userId: string, role: UserAccessLevel) {
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

    await prisma.companyUser.update({
      where: { userId_companyId: { companyId: company.id, userId } },
      data: { role }
    });

    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function revokeAccessAction(userId: string) {
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

    await prisma.companyUser.delete({
      where: { userId_companyId: { companyId: company.id, userId } }
    });
    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function deleteUserAction(model: DeleteUserModel) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const { password } = model;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return getResult(false, 1);

    await prisma.user.delete({ where: { id: user.id } });

    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function recoverPasswordAction(model: RecoverPasswordModel) {
  try {
    const { email, code, password } = model;

    const zResEmail = EmailSchema.safeParse(email);
    const zResCode = CodeSchema.safeParse(code);
    const zResPassword = PasswordSchema.safeParse(password);

    if (!zResEmail.success) return getResult(false, 1);
    if (!zResCode.success) return getResult(false, 2);
    if (!zResPassword.success) return getResult(false, 3);

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) return getResult(false, 4);

    const vCode = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code: zResCode.data,
        createdAt: { gte: new Date(Date.now() - CODE_TTL) }
      }
    });

    if (!vCode) return getResult(false, 5);

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(zResPassword.data, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash }
    });

    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}
