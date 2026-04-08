import {
  DocumentStatus,
  DocumentType,
  SignatureType,
  Language,
  Prisma,
  Document
} from "@/app/_prisma/browser";
import { CreateCompanyModel } from "./company";
import { CreateItemModel } from "../validation/item";
import { LogoAction } from "./logo";

const documentWithPartnersArgs = {
  include: { recipient: true, supplier: true }
} satisfies Prisma.DocumentDefaultArgs;

export type DocumentWithPartners = Prisma.DocumentGetPayload<
  typeof documentWithPartnersArgs
>;

const documentWithChildrenArgs = {
  include: {
    supplier: { include: { paymentMethods: true } },
    recipient: { include: { paymentMethods: true } },
    items: true,
    fromDocuments: { include: { fromDocument: true } },
    company: true
  }
} satisfies Prisma.DocumentDefaultArgs;

export type DocumentWithChildren = Prisma.DocumentGetPayload<
  typeof documentWithChildrenArgs
>;

export interface CreateDocumentModel {
  type: DocumentType;
  language: Language;
  currency: string;
  status: DocumentStatus;

  docNum: string;
  docDate: Date;
  dateFrom: Date | null;
  dateTo: Date | null;
  dueDate: Date;
  duePeriod: number;
  lateFeeRate: number;
  note: string;
  signatureType: SignatureType;
  showElectronicSignatureNotice: boolean;
  paymentMethodType: string;
  color: string;

  netTotal: number;
  grossTotal: number;
  currencyRate: number;
  showCurrencyRate: boolean;

  logoAction: LogoAction;

  supplier: CreateCompanyModel;
  recipient: CreateCompanyModel;

  items: CreateItemModel[];

  supplierSignatureName: string;
  supplierSignatureDate: Date | null;
  supplierSignatureHasLine: boolean;
  recipientSignatureName: string;
  recipientSignatureDate: Date | null;
  recipientSignatureHasLine: boolean;

  showCarrier: boolean;
  carrierCountry: string;
  carrierName: string;
  carrierRegNum: string;
  driver: string;
  vehicle: string;
  vehicleNum: string;
  originAddress: string;
  destinationAddress: string;

  fromDocuments: CreateDocumentSettlement[];
}

export interface SendDocumentModel {
  to: string;
  cc: string[];
  subject: string;
  message: string;
}

export interface CreateDocumentSettlement {
  fromDocument: Document;
  amount: number;
}

export interface CreateDocumentSettlementRow extends CreateDocumentSettlement {
  rowId: string;
}
