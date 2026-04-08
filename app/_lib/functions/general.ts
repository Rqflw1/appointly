import { Result } from "../types/general";
import en from "../dictionaries/en";
import ru from "../dictionaries/ru";
import lv from "../dictionaries/lv";
import { memo } from "react";
import { Language } from "@/app/_prisma/enums";

export function getDictionary(language: Language) {
  if (language === Language.RU) return ru;
  if (language === Language.LV) return lv;
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

export function formatNumber(value: number, digits = 2) {
  if (value === null || value === undefined || isNaN(value)) return "";
  return value.toFixed(digits);
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

export function generateRandomString(alphabet: string, length: number) {
  let string = "";
  for (let index = 0; index < length; index++)
    string += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  return string;
}
