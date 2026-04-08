import { PaymentMethodCreateWithoutCompanyInput } from "@/app/_prisma/models";
import {
  CreatePaymentMethodModel,
  CreatePaymentMethodModelRow
} from "../types/paymentMethod";
import { PaymentMethod } from "@/app/_prisma/browser";

export function mapCreatePaymentMethodsToPaymentMethodCreateWithoutCompanyInputs(
  models: CreatePaymentMethodModel[]
): PaymentMethodCreateWithoutCompanyInput[] {
  return models.map((model) => {
    const { type, name, accNum, note, showByDefault, field_1 } = model;
    return { type, name, accNum, note, showByDefault, field_1 };
  });
}

export function mapPaymentMethodsToCreatePaymentMethodModelRows(
  models: PaymentMethod[]
): CreatePaymentMethodModelRow[] {
  return models.map((model) => {
    const { id, type, name, accNum, note, showByDefault, field_1 } = model;
    return { rowId: id, type, name, accNum, note, showByDefault, field_1 };
  });
}
