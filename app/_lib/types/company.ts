import {
  Company,
  Language,
  Prisma,
  UserAccessLevel
} from "@/app/_prisma/browser";
import { CreatePaymentMethodModelRow } from "./paymentMethod";

const companyWithMethodsArgs = {
  include: { paymentMethods: true }
} satisfies Prisma.CompanyDefaultArgs;

export type CompanyWithMethods = Prisma.CompanyGetPayload<
  typeof companyWithMethodsArgs
>;

export interface CompanyWithRole extends Company {
  role: UserAccessLevel;
}

export interface CreateCompanyModel {
  isIndividual: boolean;
  country: string;
  name: string;
  regNum: string;
  vatNum: string;
  address: string;
  email: string;
  url: string;
  phone: string;
  note: string;
  comment: string;
  language: Language | null;
  currency: string;
  duePeriod: number;
  lateFeeRate: number;
  vatRate: number;
  isPartner?: boolean;
  paymentMethods?: CreatePaymentMethodModelRow[];
}

export interface UpdateCompanySmtpModel {
  smtpHost: string;
  smtpUser: string;
  smtpPassword: string;
}
