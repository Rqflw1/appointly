"use server";

import { prisma } from "@/app/_lib/constants/prisma";
import { getResult } from "@/app/_lib/functions/general";
import { ReminderSchema } from "@/app/_lib/validation/reminder";
import { getSessionAndUser } from "../serverFunctions/auth";
import { scopeId } from "../serverFunctions/rbac";
import { logAudit } from "../serverFunctions/audit";
import { verifyCsrfToken } from "../serverFunctions/csrf";
import { ReminderStatus } from "@/app/_prisma/enums";
import { revalidatePath } from "next/cache";

export async function createReminderAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401, null);

    const data = {
      clientId: String(formData.get("clientId") || ""),
      appointmentId: String(formData.get("appointmentId") || "") || null,
      type: String(formData.get("type") || "APPOINTMENT"),
      remindAt: String(formData.get("remindAt") || ""),
      status: String(formData.get("status") || "PENDING"),
      message: String(formData.get("message") || "")
    };
    const zRes = ReminderSchema.safeParse(data);
    if (!zRes.success) return getResult(false, 400, null);

    const client = await prisma.client.findFirst({ where: { id: zRes.data.clientId } });
    if (!client) return getResult(false, 404, null);
    if (!scopeId(user, client.managerId)) return getResult(false, 403, null);

    if (zRes.data.appointmentId) {
      const appointment = await prisma.appointment.findFirst({
        where: { id: zRes.data.appointmentId }
      });
      if (!appointment) return getResult(false, 404, null);
      if (!scopeId(user, appointment.managerId)) return getResult(false, 403, null);
      if (appointment.clientId !== zRes.data.clientId)
        return getResult(false, 400, null);
    }

    const reminder = await prisma.reminder.create({
      data: {
        managerId: user.id,
        clientId: zRes.data.clientId,
        appointmentId: zRes.data.appointmentId || null,
        type: zRes.data.type,
        remindAt: new Date(zRes.data.remindAt),
        status: zRes.data.status,
        message: zRes.data.message
      }
    });

    await logAudit({
      userId: user.id,
      action: "create_reminder",
      entityType: "reminder",
      entityId: reminder.id,
      description: `Created reminder ${reminder.id}`
    });

    revalidatePath("/reminders");
    revalidatePath("/dashboard");
    return getResult(true, 200, reminder.id);
  } catch {
    return getResult(false, 500, null);
  }
}

export async function markReminderSentAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401, null);

    const id = String(formData.get("id") || "");
    const existing = await prisma.reminder.findFirst({ where: { id } });
    if (!existing) return getResult(false, 404, null);
    if (!scopeId(user, existing.managerId)) return getResult(false, 403, null);

    await prisma.reminder.update({
      where: { id },
      data: { status: ReminderStatus.SENT }
    });

    await logAudit({
      userId: user.id,
      action: "update_reminder",
      entityType: "reminder",
      entityId: id,
      description: `Marked reminder ${id} as sent`
    });

    revalidatePath("/reminders");
    revalidatePath("/dashboard");
    return getResult(true, 200, id);
  } catch {
    return getResult(false, 500, null);
  }
}

export async function deleteReminderAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401, null);

    const id = String(formData.get("id") || "");
    const existing = await prisma.reminder.findFirst({ where: { id } });
    if (!existing) return getResult(false, 404, null);
    if (!scopeId(user, existing.managerId)) return getResult(false, 403, null);

    await prisma.reminder.delete({ where: { id } });

    await logAudit({
      userId: user.id,
      action: "delete_reminder",
      entityType: "reminder",
      entityId: id,
      description: `Deleted reminder ${id}`
    });

    revalidatePath("/reminders");
    revalidatePath("/dashboard");
    return getResult(true, 200, id);
  } catch {
    return getResult(false, 500, null);
  }
}
