"use server";

import { prisma } from "@/app/_lib/constants/prisma";
import { logger } from "../constants/logger";
import { getResult } from "../functions/general";
import { DocumentType, Permission } from "@/app/_prisma/enums";
import { CreateEmailSettingsModel } from "../types/emailSettings";
import { MailOptions, SMTPOptions } from "../types/mail";
import { sendMail } from "../serverFunctions/mail";
import { decryptData } from "../serverFunctions/crypto";
import { getSessionAndUser } from "../serverFunctions/auth";
import { refresh } from "next/cache";
import { hasPermission } from "../serverFunctions/permissions";
import { getCompanyFromCookies } from "../serverFunctions/company";

export async function getEmailSettingsAction(type: DocumentType) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (
      !(await hasPermission(user, company.id, Permission.COMPANY_SETTINGS_READ))
    )
      return getResult(false, 403);

    const emailSettings = await prisma.emailSettings.findFirst({
      where: { companyId: company.id, type }
    });

    return getResult(true, 0, emailSettings);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}

export async function upsertEmailSettingsAction(
  model: CreateEmailSettingsModel
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

    const { type, cc, subject, message } = model;

    await prisma.emailSettings.upsert({
      where: { companyId_type: { type, companyId: company.id } },
      update: { cc: cc.join(), subject, message },
      create: { type, cc: cc.join(), subject, message, companyId: company.id }
    });

    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function sendTestEmailAction() {
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

    if (!company.smtpHost || !company.smtpUser || !company.smtpPassword)
      return getResult(false, 1);

    const emailModel: MailOptions = {
      from: { name: company.name, address: company.smtpUser },
      to: user.email,
      subject: "Test SMTP settings",
      html: "Test SMTP settings"
    };

    const smtpPassword = decryptData(
      Buffer.from(company.smtpPassword),
      Buffer.from(company.smtpPasswordDek)
    );

    let smtpOptions: SMTPOptions = {
      host: company.smtpHost,
      port: 465,
      secure: true,
      auth: { user: company.smtpUser, pass: smtpPassword }
    };

    const res = await sendMail(emailModel, smtpOptions);
    if (!res.ok) return getResult(false, 2);
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}
