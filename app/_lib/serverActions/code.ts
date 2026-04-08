"use server";

import { prisma } from "@/app/_lib/constants/prisma";
import { CODE_TTL } from "../constants/code";
import { NEXT_PUBLIC_BASE_URL, SMTP_USER } from "../constants/general";
import { logger } from "../constants/logger";
import { generateRandomString, getResult } from "../functions/general";
import { CreateCodeModel, ValidateCodeModel } from "../types/code";
import { CodeSchema, EmailSchema } from "../validation/general";
import { sendMail } from "../serverFunctions/mail";
import { getFullName } from "../functions/user";

export async function createCodeAction(model: CreateCodeModel) {
  try {
    const { email } = model;

    const zResEmail = EmailSchema.safeParse(email);
    if (!zResEmail.success) return getResult(false, 1);

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) return getResult(false, 2);

    const alphabet = "0123456789";
    let code = "";
    let error = true;
    const codes = await prisma.verificationCode.findMany({
      select: { code: true }
    });
    for (let i = 0; i < 10; i++) {
      code = generateRandomString(alphabet, 6);
      const codeExists = !!codes.find(({ code: dbCode }) => dbCode === code);
      error = codeExists;
      if (!codeExists) break;
    }

    if (error) return getResult(false, 3);

    await prisma.verificationCode.create({ data: { code, userId: user.id } });

    const templateUrl = `${NEXT_PUBLIC_BASE_URL}/templates/code-mail-template.html`;
    let html = await fetch(templateUrl)
      .then((res) => res.text())
      .catch(() => "");

    html = html.replaceAll("{{fullName}}", getFullName(user));
    html = html.replaceAll("{{code}}", code);

    const res = await sendMail({
      from: SMTP_USER,
      to: user.email,
      subject: "Verification Code",
      html
    });

    if (!res.ok) return getResult(false, 4);

    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}

export async function validateCodeAction(model: ValidateCodeModel) {
  try {
    const { email, code } = model;

    const zResEmail = EmailSchema.safeParse(email);
    const zResCode = CodeSchema.safeParse(code);

    if (!zResEmail.success) return getResult(false, 1);
    if (!zResCode.success) return getResult(false, 2);

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) return getResult(false, 3);

    const vCode = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code: zResCode.data,
        createdAt: { gte: new Date(Date.now() - CODE_TTL) }
      }
    });

    if (!vCode) return getResult(false, 4);

    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}
