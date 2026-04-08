import { toast } from "sonner";
import { Dictionary } from "../types/general";
import { countries, Country } from "./countries";
import {
  DocumentStatus,
  DocumentType,
  Language,
  PaymentMethodType,
  SignatureType,
  UserAccessLevel
} from "@/app/_prisma/enums";

export const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";
export const AES_SECRET = process.env.AES_SECRET ?? "";
export const SMTP_URL = process.env.SMTP_URL ?? "";
export const SMTP_USER = process.env.SMTP_USER ?? "";
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD ?? "";
export const SCW_BUCKET = process.env.SCW_BUCKET || "";
export const EXCHANGE_API_URL = process.env.EXCHANGE_API_URL || "";
export const EXCHANGE_API_KEY = process.env.EXCHANGE_API_KEY || "";
export const VIES_API_URL = process.env.VIES_API_URL || "";
export const VIES_API_ID = process.env.VIES_API_ID || "";
export const VIES_API_KEY = process.env.VIES_API_KEY || "";

export const DEFAULT_LANGUAGE = Language.EN;
export const DEFAULT_CURRENCY = "EUR";
export const DEFAULT_DUE_PERIOD = 30;
export const DEFAULT_LATE_FEE_RATE = 0;
export const DEFAULT_VAT_RATE = 0.21;
export const DEFAULT_COLOR = "#8243e5";

export const LOCALE = {
  [Language.EN]: "en-US",
  [Language.LV]: "lv-LV",
  [Language.RU]: "ru-RU"
};

export const DEFAULT_COUNTRY: Country = countries.find(
  ({ iso2 }) => iso2 === "LV"
) || { name: "Latvia", iso2: "LV", iso3: "LVA", code: "371" };

export const DEFAULT_PAGINATION_STATE = {
  pageIndex: 0,
  pageSize: 25
};

export const toastHelper = {
  success: (dict: Dictionary) =>
    toast.success(dict.labels.success, {
      richColors: true,
      duration: 2000
    }),
  error: (dict: Dictionary) =>
    toast.error(dict.errors.unexpectedError, {
      richColors: true,
      duration: 2000
    })
};

export const types = Object.values(DocumentType);
export const statuses = Object.values(DocumentStatus);
export const languages = Object.values(Language);
export const signatureTypes = Object.values(SignatureType);
export const roles = Object.values(UserAccessLevel);
export const paymentTypes = Object.values(PaymentMethodType);
