import { PaymentMethodType } from "@/app/_prisma/enums";
import { CreateCompanyModel } from "../types/company";
import { CreateItemModelRow } from "../types/item";
import { CreatePaymentMethodModelRow } from "../types/paymentMethod";
import { DEFAULT_COUNTRY } from "./general";

export const emptyCompany: CreateCompanyModel = {
  isIndividual: false,
  country: DEFAULT_COUNTRY.iso2,
  name: "",
  regNum: "",
  vatNum: "",
  address: "",
  email: "",
  url: "",
  phone: "",
  note: "",
  comment: "",
  language: null,
  currency: "",
  duePeriod: NaN,
  lateFeeRate: NaN,
  vatRate: NaN,

  paymentMethods: []
};

export const emptyItem: CreateItemModelRow = {
  rowId: "",
  sku: "",
  name: "",
  description: "",
  unit: "",
  quantity: 1,
  currency: "",
  basePrice: 0,
  discountRate: 0,
  discountValue: 0,
  netPrice: 0,
  vatRate: 0,
  vatValue: 0,
  grossPrice: 0,
  baseTotal: 0,
  discountTotal: 0,
  netTotal: 0,
  vatTotal: 0,
  grossTotal: 0
};

export const emptyPaymentMethod: CreatePaymentMethodModelRow = {
  rowId: "",
  type: PaymentMethodType.BANK,
  name: "",
  accNum: "",
  note: "",
  showByDefault: true,
  field_1: ""
};
