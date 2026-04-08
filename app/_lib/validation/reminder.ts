import { z } from "zod";
import { ReminderStatus, ReminderType } from "@/app/_prisma/enums";

export const ReminderSchema = z.object({
  clientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional().nullable(),
  type: z.nativeEnum(ReminderType),
  remindAt: z.string().min(1),
  status: z.nativeEnum(ReminderStatus),
  message: z.string().min(1)
});
