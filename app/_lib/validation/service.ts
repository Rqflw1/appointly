import { z } from "zod";

export const ServiceSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  price: z.coerce.number().min(0),
  durationMinutes: z.coerce.number().int().min(5)
});
