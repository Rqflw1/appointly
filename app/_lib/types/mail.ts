import { Options } from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export type MailOptions = Options;
export type SMTPOptions = SMTPTransport.Options;
