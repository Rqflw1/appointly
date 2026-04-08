import { z } from "zod";
import { Language, PaymentMethodType } from "@/app/_prisma/enums";

export const CreatePartnerPaymentMethodModelSchema = z.object({
  type: z.enum(PaymentMethodType),
  name: z.string(),
  accNum: z.string(),
  note: z.string(),
  showByDefault: z.boolean(),
  field_1: z.string()
});

export const CreatePartnerModelSchema = z.object({
  isIndividual: z.boolean(),
  country: z.string(),
  name: z.string(),
  regNum: z.string(),
  vatNum: z.string(),
  address: z.string(),
  email: z.string(),
  url: z.string(),
  phone: z.string(),
  note: z.string(),
  comment: z.string(),
  language: z.enum(Language).nullable(),
  currency: z.string(),
  duePeriod: z.number().nullable(),
  lateFeeRate: z.number().nullable(),
  vatRate: z.number().nullable(),
  paymentMethods: z.array(CreatePartnerPaymentMethodModelSchema).optional()
});

export const CreatePartnersModelSchema = z.array(CreatePartnerModelSchema);
export type CreatePartnerModel = z.infer<typeof CreatePartnerModelSchema>;
