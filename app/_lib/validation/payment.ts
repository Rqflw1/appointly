import { z } from "zod";
import { PaymentMethod } from "@/app/_prisma/enums";

export const PaymentSchema = z.object({
  clientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional().nullable(),
  amount: z.coerce.number().min(0),
  method: z.nativeEnum(PaymentMethod),
  paymentDate: z.string().min(1),
  notes: z.string().optional().default("")
});
