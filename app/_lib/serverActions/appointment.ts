"use server";

import { prisma } from "@/app/_lib/constants/prisma";
import { getResult } from "@/app/_lib/functions/general";
import { AppointmentSchema } from "@/app/_lib/validation/appointment";
import { getSessionAndUser } from "../serverFunctions/auth";
import { scopeId } from "../serverFunctions/rbac";
import { logAudit } from "../serverFunctions/audit";
import { verifyCsrfToken } from "../serverFunctions/csrf";
import { revalidatePath } from "next/cache";

function getDayRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

async function hasConflict(
  managerId: string,
  startAt: Date,
  durationMinutes: number,
  excludeId?: string
) {
  const { start, end } = getDayRange(startAt);
  const existing = await prisma.appointment.findMany({
    where: {
      managerId,
      startAt: { gte: start, lte: end },
      id: excludeId ? { not: excludeId } : undefined
    }
  });
  const endAt = new Date(startAt.getTime() + durationMinutes * 60000);

  return existing.some((appt) => {
    const apptEnd = new Date(
      appt.startAt.getTime() + appt.durationMinutes * 60000
    );
    return startAt < apptEnd && endAt > appt.startAt;
  });
}

export async function createAppointmentAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401, null);

    const data = {
      clientId: String(formData.get("clientId") || ""),
      serviceId: String(formData.get("serviceId") || ""),
      startAt: String(formData.get("startAt") || ""),
      durationMinutes: formData.get("durationMinutes") || 0,
      status: String(formData.get("status") || "PLANNED"),
      price: formData.get("price") || 0,
      paymentStatus: String(formData.get("paymentStatus") || "UNPAID"),
      notes: String(formData.get("notes") || "")
    };
    const zRes = AppointmentSchema.safeParse(data);
    if (!zRes.success) return getResult(false, 400, null);

    const startAt = new Date(zRes.data.startAt);
    const duration = zRes.data.durationMinutes;

    const conflict = await hasConflict(user.id, startAt, duration);
    if (conflict) return getResult(false, 409, "conflict");

    const client = await prisma.client.findFirst({
      where: { id: zRes.data.clientId }
    });
    if (!client) return getResult(false, 404, null);
    if (!scopeId(user, client.managerId)) return getResult(false, 403, null);

    const service = await prisma.service.findFirst({
      where: { id: zRes.data.serviceId }
    });
    if (!service) return getResult(false, 404, null);
    if (!scopeId(user, service.managerId)) return getResult(false, 403, null);

    const price = zRes.data.price || Number(service.price || 0);

    const appointment = await prisma.appointment.create({
      data: {
        managerId: user.id,
        clientId: zRes.data.clientId,
        serviceId: zRes.data.serviceId,
        startAt,
        durationMinutes: duration,
        status: zRes.data.status,
        price,
        paymentStatus: zRes.data.paymentStatus,
        notes: zRes.data.notes
      }
    });

    await logAudit({
      userId: user.id,
      action: "create_appointment",
      entityType: "appointment",
      entityId: appointment.id,
      description: `Created appointment ${appointment.id}`
    });

    revalidatePath("/appointments");
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return getResult(true, 200, appointment.id);
  } catch {
    return getResult(false, 500, null);
  }
}

export async function updateAppointmentAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401, null);

    const id = String(formData.get("id") || "");
    const data = {
      clientId: String(formData.get("clientId") || ""),
      serviceId: String(formData.get("serviceId") || ""),
      startAt: String(formData.get("startAt") || ""),
      durationMinutes: formData.get("durationMinutes") || 0,
      status: String(formData.get("status") || "PLANNED"),
      price: formData.get("price") || 0,
      paymentStatus: String(formData.get("paymentStatus") || "UNPAID"),
      notes: String(formData.get("notes") || "")
    };
    const zRes = AppointmentSchema.safeParse(data);
    if (!zRes.success) return getResult(false, 400, null);

    const existing = await prisma.appointment.findFirst({ where: { id } });
    if (!existing) return getResult(false, 404, null);
    if (!scopeId(user, existing.managerId)) return getResult(false, 403, null);

    const startAt = new Date(zRes.data.startAt);
    const duration = zRes.data.durationMinutes;
    const conflict = await hasConflict(user.id, startAt, duration, id);
    if (conflict) return getResult(false, 409, "conflict");

    const client = await prisma.client.findFirst({
      where: { id: zRes.data.clientId }
    });
    if (!client) return getResult(false, 404, null);
    if (!scopeId(user, client.managerId)) return getResult(false, 403, null);

    const service = await prisma.service.findFirst({
      where: { id: zRes.data.serviceId }
    });
    if (!service) return getResult(false, 404, null);
    if (!scopeId(user, service.managerId)) return getResult(false, 403, null);

    const price = zRes.data.price || Number(service.price || 0);

    await prisma.appointment.update({
      where: { id },
      data: {
        clientId: zRes.data.clientId,
        serviceId: zRes.data.serviceId,
        startAt,
        durationMinutes: duration,
        status: zRes.data.status,
        price,
        paymentStatus: zRes.data.paymentStatus,
        notes: zRes.data.notes
      }
    });

    await logAudit({
      userId: user.id,
      action: "update_appointment",
      entityType: "appointment",
      entityId: id,
      description: `Updated appointment ${id}`
    });

    revalidatePath("/appointments");
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return getResult(true, 200, id);
  } catch {
    return getResult(false, 500, null);
  }
}

export async function deleteAppointmentAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401, null);

    const id = String(formData.get("id") || "");
    const existing = await prisma.appointment.findFirst({ where: { id } });
    if (!existing) return getResult(false, 404, null);
    if (!scopeId(user, existing.managerId)) return getResult(false, 403, null);

    await prisma.appointment.delete({ where: { id } });

    await logAudit({
      userId: user.id,
      action: "delete_appointment",
      entityType: "appointment",
      entityId: id,
      description: `Deleted appointment ${id}`
    });

    revalidatePath("/appointments");
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return getResult(true, 200, id);
  } catch {
    return getResult(false, 500, null);
  }
}
