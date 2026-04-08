import { toast } from "sonner";
import { Dictionary } from "../types/general";
import {
  AppointmentStatus,
  Language,
  PaymentMethod,
  PaymentStatus,
  ReminderStatus,
  ReminderType,
  UserRole
} from "@/app/_prisma/enums";

export const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";

export const DEFAULT_LANGUAGE = Language.EN;
export const DEFAULT_TIMEZONE = process.env.APP_TIMEZONE || "Europe/Moscow";

export const LOCALE = {
  [Language.EN]: "en-US",
  [Language.RU]: "ru-RU",
  [Language.LV]: "lv-LV"
};

export const DEFAULT_PAGINATION_STATE = {
  pageIndex: 0,
  pageSize: 20
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

export const roles = Object.values(UserRole);
export const appointmentStatuses = Object.values(AppointmentStatus);
export const paymentStatuses = Object.values(PaymentStatus);
export const paymentMethods = Object.values(PaymentMethod);
export const reminderStatuses = Object.values(ReminderStatus);
export const reminderTypes = Object.values(ReminderType);
