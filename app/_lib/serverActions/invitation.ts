"use server";

import { prisma } from "@/app/_lib/constants/prisma";
import { getResult } from "../functions/general";
import { logger } from "../constants/logger";
import { CreateInvitationModel } from "../types/invitation";
import { Permission, UserAccessLevel } from "@/app/_prisma/enums";
import { MailOptions } from "../types/mail";
import { NEXT_PUBLIC_BASE_URL, SMTP_USER } from "../constants/general";
import { sendMail } from "../serverFunctions/mail";
import { getSessionAndUser } from "../serverFunctions/auth";
import { refresh } from "next/cache";
import { hasPermission } from "../serverFunctions/permissions";
import { getCompanyFromCookies } from "../serverFunctions/company";

export async function createAndSendInvitationAction(
  model: CreateInvitationModel
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

    const { email, role } = model;

    const invitation = await prisma.invitation.create({
      data: { email, role, companyId: company.id }
    });

    const link = `${NEXT_PUBLIC_BASE_URL}/invitations/${invitation.id}`;
    const emailModel: MailOptions = {
      from: { name: company.name, address: SMTP_USER },
      to: invitation.email,
      subject: "Invitation",
      html: `Invitation link:\n${link}`
    };
    const res = await sendMail(emailModel);
    refresh();
    if (!res.ok) return getResult(false, 1);

    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function updateAndSendInvitationAction(id: string, email: string) {
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

    const invitation = await prisma.invitation.update({
      where: { id },
      data: { email }
    });

    const link = `${NEXT_PUBLIC_BASE_URL}/invitations/${invitation.id}`;
    const emailModel: MailOptions = {
      from: { name: company.name, address: SMTP_USER },
      to: invitation.email,
      subject: "Invitation",
      html: `Invitation link:\n${link}`
    };
    const res = await sendMail(emailModel);
    refresh();
    if (!res.ok) return getResult(false, 1);

    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function changeInvitationRoleAction(
  id: string,
  role: UserAccessLevel
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

    await prisma.invitation.update({ where: { id }, data: { role } });

    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function acceptInvitationAction(id: string) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const invitation = await prisma.invitation.findFirst({ where: { id } });
    if (!invitation) return getResult(false, 1);

    const companies = (
      await prisma.companyUser.findMany({
        where: { userId: user.id },
        include: { company: true }
      })
    ).map(({ company }) => company);
    if (!companies.find(({ id }) => id === invitation.companyId)) {
      await prisma.companyUser.create({
        data: {
          companyId: invitation.companyId,
          userId: user.id,
          role: invitation.role
        }
      });
    }

    await prisma.invitation.delete({ where: { id } });

    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function deleteInvitationAction(id: string) {
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

    await prisma.invitation.delete({ where: { id } });
    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}
