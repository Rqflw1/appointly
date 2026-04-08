import { z } from "zod";
import { AppointmentStatus, PaymentStatus } from "@/app/_prisma/enums";

export const AppointmentSchema = z.object({
  clientId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startAt: z.string().min(1),
  durationMinutes: z.coerce.number().int().min(5),
  status: z.nativeEnum(AppointmentStatus),
  price: z.coerce.number().min(0),
  paymentStatus: z.nativeEnum(PaymentStatus),
  notes: z.string().optional().default("")
});
