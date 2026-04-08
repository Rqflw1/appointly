import { z } from "zod";

export const ClientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() === "") return undefined;
      return value;
    },
    z.string().min(1).optional()
  ),
  phone: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() === "") return undefined;
      return value;
    },
    z.string().min(3).optional()
  ),
  email: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() === "") return undefined;
      return value;
    },
    z.string().email().optional()
  ),
  notes: z.string().optional().default("")
});
