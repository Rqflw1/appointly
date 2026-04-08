import { DocumentType, EmailSettings } from "@/app/_prisma/browser";

export interface CreateEmailSettingsModel {
  type: DocumentType;
  cc: string[];
  subject: string;
  message: string;
}

export type EmailSettingsDict = Record<DocumentType, EmailSettings | null>;
