import {
  DocumentSettings,
  DocumentType,
  IndexRefreshRate
} from "@/app/_prisma/browser";

export interface CreateDocumentSettingsModel {
  type: DocumentType;
  docNum: string;
  indexRefreshRate: IndexRefreshRate;
  index: number;
  note: string;
}

export type DocumentSettingsDict = Record<
  DocumentType,
  DocumentSettings | null
>;
