import { Result } from "../types/general";
import en from "../dictionaries/en";
import lv from "../dictionaries/lv";
import ru from "../dictionaries/ru";
import { LOCALE } from "../constants/general";
import { memo } from "react";
import { Language } from "@/app/_prisma/enums";
import { CreateItemModel } from "../validation/item";
import { CreateDocumentSettlement } from "../types/document";

export function getDictionary(language: Language) {
  if (language === Language.EN) return en;
  if (language === Language.LV) return lv;
  if (language === Language.RU) return ru;
  return en;
}

export function getParam(
  params: { [key: string]: string | string[] | undefined },
  key: string
) {
  const value = params[key];
  if (value === undefined) return [];
  if (typeof value === "string") return [value];
  return value;
}

export function getResult<B extends true | false, T = null>(
  ok: B,
  code: number,
  data: T = null as any
): Result<B, T> {
  return { ok, code, data };
}

export function typedMemo<T>(component: T): T {
  return memo(component as any) as any;
}

export function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function toFixed(value: number, digits: number) {
  return isNaN(value) ? "" : value.toFixed(digits);
}

export function toString(value: number) {
  return isNaN(value) ? "" : `${value}`;
}

export function formatNumberWithSpaces(value: string | number) {
  if (value === null || value === undefined) return "";
  const raw = typeof value === "number" ? `${value}` : value;
  if (raw === "" || raw === "-" || raw === "." || raw === "-.") return raw;

  const isNegative = raw.startsWith("-");
  const unsigned = isNegative ? raw.slice(1) : raw;
  const [intPart, decimalPart] = unsigned.split(".", 2);

  const formattedInt = intPart
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    : "";

  const formatted =
    decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt;

  return `${isNegative ? "-" : ""}${formatted}`;
}

interface CalculatPriceProps {
  quantity: number;
  basePrice: number;
  discountRate: number;
  vatRate: number | null;
}

export function calculatePriceProps(props: CalculatPriceProps) {
  const quantity = props.quantity || 1; // Can't be NaN or 0
  const basePrice = props.basePrice || 0; // Can't be NaN
  const discountRate = props.discountRate || 0; // Can't be NaN
  const vatRate = props.vatRate; // Can be NaN or null but use 0 in calculations

  const discountValue = round(basePrice * discountRate, 4);
  const netPrice = round(basePrice - discountValue, 4);

  const baseTotal = round(basePrice * quantity, 2);
  const netTotalNotRounded = netPrice * quantity;
  const netTotal = round(netTotalNotRounded, 2);
  const discountTotal = round(netTotal - baseTotal, 2);
  const vatTotal = round(netTotalNotRounded * (vatRate || 0), 2);
  const grossTotal = round(netTotal + vatTotal, 2);

  const vatValue = round(vatTotal / quantity, 2);
  const grossPrice = round(grossTotal / quantity, 2);

  return {
    quantity,
    basePrice,
    discountRate,
    discountValue,
    netPrice,
    vatRate,
    vatValue,
    grossPrice,
    baseTotal,
    discountTotal,
    netTotal,
    vatTotal,
    grossTotal
  };
}

export function calculateDocumentTotals(
  items: (Omit<CreateItemModel, "vatRate"> & { vatRate: null | number })[],
  dueDate: Date,
  lateFeeRate: number,
  fromDocuments: CreateDocumentSettlement[]
) {
  let baseTotal = 0;
  let discountTotal = 0;
  let netTotal = 0;
  let nonTaxableNetTotal = 0;
  const vats = new Map<number, { taxableNetTotal: number; vatTotal: number }>();
  let vatTotal = 0;
  let lateFeeTotal = 0;
  let subtotal = 0;
  let prepaidTotal = 0;
  let grossTotal = 0;

  items.forEach((item) => {
    baseTotal = baseTotal + item.baseTotal;
    discountTotal = discountTotal + item.discountTotal;
    netTotal = netTotal + item.netTotal;
    subtotal = subtotal + item.grossTotal;

    if (item.vatRate === null || isNaN(item.vatRate))
      nonTaxableNetTotal = nonTaxableNetTotal + item.netTotal;
    else {
      const vat = vats.get(item.vatRate) ?? {
        taxableNetTotal: 0,
        vatTotal: 0
      };
      vat.taxableNetTotal = vat.taxableNetTotal + item.netTotal;
      vat.vatTotal = vat.vatTotal + item.vatTotal;
      vats.set(item.vatRate, vat);

      vatTotal = vatTotal + item.vatTotal;
    }
  });

  // const dueDateNormalized = new Date(
  //   dueDate.getFullYear(),
  //   dueDate.getMonth(),
  //   dueDate.getDate()
  // );
  // const now = new Date();
  // const nowDateNormalized = new Date(
  //   now.getFullYear(),
  //   now.getMonth(),
  //   now.getDate()
  // );
  // const lateDays = Math.trunc(
  //   (nowDateNormalized.getTime() - dueDateNormalized.getTime()) /
  //     (1000 * 60 * 60 * 24)
  // );
  // if (lateDays > 0) {
  //   lateFeeTotal = round(
  //     subtotal * Math.pow(1 + lateFeeRate, lateDays) - subtotal,
  //     2
  //   );
  //   subtotal = subtotal + lateFeeTotal;
  // }

  fromDocuments.forEach((document) => {
    prepaidTotal = prepaidTotal + document.amount;
  });
  grossTotal = subtotal + prepaidTotal;

  return {
    baseTotal,
    discountTotal,
    netTotal,
    nonTaxableNetTotal,
    vats,
    vatTotal,
    subtotal,
    lateFeeTotal,
    grossTotal
  };
}

export function generateRandomString(alphabet: string, length: number) {
  let string = "";
  for (let index = 0; index < length; index++)
    string += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  return string;
}

// export function getLanguage(langRaw: string) {
//   const zResLang = LanguageSchema.safeParse(langRaw);
//   if (zResLang.success) return zResLang.data;
//   return DEFAULT_LANGUAGE;
// }

export function formatDateShortWithoutYear(date: Date, lang: Language) {
  return date.toLocaleDateString(LOCALE[lang], {
    month: "short",
    day: "numeric"
  });
}

export function formatDateShortWithYear(date: Date, lang: Language) {
  return date.toLocaleDateString(LOCALE[lang], {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export function formatDate(date: Date, lang: Language) {
  return date.toLocaleDateString(LOCALE[lang], {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export function formatDateTime(date: Date, lang: Language) {
  return date.toLocaleDateString(LOCALE[lang], {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

export function removeDiacritics(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function compareNumbers(value_1: number, value_2: number) {
  return (isNaN(value_1) && isNaN(value_2)) || value_1 === value_2;
}
