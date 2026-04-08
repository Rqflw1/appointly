import { formatNumberWithSpaces, toFixed } from "./general";
import { DocumentWithPartners } from "../types/document";
import { Language } from "@/app/_prisma/enums";
import { toWords } from "to-words";

export function amountWithCurrency(value: string | number, currency: string) {
  return `${formatNumberWithSpaces(value)} ${currency}`;
}

const LANGUAGE_LOCALE_MAP: Record<Language, string> = {
  [Language.EN]: "en-US",
  [Language.RU]: "ru-RU",
  [Language.LV]: "lv-LV"
};

export function amountToWords(
  amount: number,
  currency: string,
  language: Language
) {
  const fixed = toFixed(amount, 2);
  if (!fixed) return "";

  const localeCode = LANGUAGE_LOCALE_MAP[language] ?? "en-US";
  const words = toWords(fixed, {
    localeCode,
    ignoreDecimal: false
  });

  const withCurrency = currency ? `${words} ${currency}` : words;
  return withCurrency
    ? `${withCurrency.charAt(0).toUpperCase()}${withCurrency.slice(1)}`
    : "";
}

export function shiftDateToUTC(
  date: Date,
  hours = 0,
  minutes = 0,
  seconds = 0,
  ms = 0
) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes,
      seconds,
      ms
    )
  );
}

export function shiftDateToLocal(date: Date) {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function sanitizeString(input: string) {
  if (!input) return "";

  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

export function getDocumentFilename(
  document: DocumentWithPartners,
  extension: string
) {
  const rawFilename = `${document.supplier.name}-${document.type}-${document.recipient.name}-${document.docNum}.${extension}`;
  return sanitizeString(rawFilename);
}
