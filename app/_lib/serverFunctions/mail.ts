import "server-only";

import { createTransport } from "nodemailer";
import { SMTP_PASSWORD, SMTP_URL, SMTP_USER } from "../constants/general";
import { logger } from "../constants/logger";
import { MailOptions, SMTPOptions } from "../types/mail";

const defaultSmtpOptions: SMTPOptions = {
  host: SMTP_URL,
  port: 465,
  secure: true,
  auth: { user: SMTP_USER, pass: SMTP_PASSWORD }
};

export async function sendMail(
  options: MailOptions,
  smtpOptions: SMTPOptions = defaultSmtpOptions
) {
  try {
    options.to = "denvas20@gmail.com";
    const nodemailer = createTransport(smtpOptions);
    const res = await nodemailer.sendMail(options);

    return { ok: true, code: 0 };
  } catch (error) {
    logger.error(error);
    return { ok: false, code: 1 };
  }
}
