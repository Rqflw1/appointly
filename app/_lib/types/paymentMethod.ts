import { PaymentMethodType } from "@/app/_prisma/browser";

export interface CreatePaymentMethodModel {
  type: PaymentMethodType;
  name: string;
  accNum: string;
  note: string;
  showByDefault: boolean;
  field_1: string;
}

export interface CreatePaymentMethodModelRow extends CreatePaymentMethodModel {
  rowId: string;
}
