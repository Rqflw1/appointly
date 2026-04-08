import { z } from "zod";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+=[\]{}|;:'",.<>\/?`~-]{8,}$/;
export const docIndexRegex = /\{N(\d+)\}/;
export const docIndexRegexG = /\{N(\d+)\}/g;
export const colorRegex = /^([#])([A-Fa-f0-9]{6})$/;

export const EmailSchema = z.email();
export const PasswordSchema = z.string().min(8).regex(passwordRegex);
export const CodeSchema = z.string().trim().length(6).regex(/^\d+$/);

export const CredentialSchema = z.object({
  email: EmailSchema,
  password: z.string()
});

export const DateRangeSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional()
});

export const ExchangeRateApiResponseSchema = z.object({
  base_code: z.literal("EUR"),
  result: z.literal("success"),
  conversion_rates: z.record(z.string(), z.number())
});

export const ViesResponseSchema = z.object({
  vies: z.object({
    valid: z.boolean(),
    traderName: z.string().optional(),
    traderAddress: z.string().optional(),
    countryCode: z.string(),
    vatNumber: z.string()
  })
});

export const ExportRecordsModelSchema = z.object({
  ids: z.array(z.string()).optional()
});
