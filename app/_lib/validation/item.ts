import { z } from "zod";

export const CreateItemModelSchema = z.object({
  sku: z.string(),
  name: z.string(),
  description: z.string(),
  unit: z.string(),
  quantity: z.number(),
  currency: z.string(),
  basePrice: z.number(),
  discountRate: z.number(),
  discountValue: z.number(),
  netPrice: z.number(),
  vatRate: z.number().nullable(),
  vatValue: z.number(),
  grossPrice: z.number(),
  baseTotal: z.number(),
  discountTotal: z.number(),
  netTotal: z.number(),
  vatTotal: z.number(),
  grossTotal: z.number()
});

export const CreateItemsModelSchema = z.array(CreateItemModelSchema);
export type CreateItemModel = z.infer<typeof CreateItemModelSchema>;
