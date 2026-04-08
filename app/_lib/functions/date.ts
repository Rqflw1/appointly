export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function startOfWeek(date: Date) {
  const day = date.getDay();
  const diff = (day + 6) % 7; // Monday as start
  const start = new Date(date);
  start.setDate(date.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

import { DEFAULT_TIMEZONE } from "@/app/_lib/constants/general";

export function formatDate(date: Date, locale: string, timeZone = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone
  }).format(date);
}

export function formatTime(date: Date, locale: string, timeZone = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone
  }).format(date);
}

export function formatDateTime(date: Date, locale: string, timeZone = DEFAULT_TIMEZONE) {
  return `${formatDate(date, locale, timeZone)} ${formatTime(date, locale, timeZone)}`;
}
