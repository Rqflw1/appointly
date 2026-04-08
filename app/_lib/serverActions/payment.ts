"use server";

import { prisma } from "@/app/_lib/constants/prisma";
import { getResult } from "@/app/_lib/functions/general";
import { PaymentSchema } from "@/app/_lib/validation/payment";
import { getSessionAndUser } from "../serverFunctions/auth";
import { scopeId } from "../serverFunctions/rbac";
import { logAudit } from "../serverFunctions/audit";
import { verifyCsrfToken } from "../serverFunctions/csrf";
import { PaymentStatus } from "@/app/_prisma/enums";
import { revalidatePath } from "next/cache";

async function updateAppointmentPaymentStatus(appointmentId: string) {
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId },
    include: { payments: true }
  });
  if (!appointment) return;

  const totalPaid = appointment.payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );
  let status: PaymentStatus = PaymentStatus.UNPAID;

  if (totalPaid <= 0) status = PaymentStatus.UNPAID;
  else if (totalPaid < Number(appointment.price))
    status = PaymentStatus.PARTIALLY_PAID;
  else status = PaymentStatus.PAID;

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { paymentStatus: status }
  });
}

export async function createPaymentAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401, null);

    const data = {
      clientId: String(formData.get("clientId") || ""),
      appointmentId: String(formData.get("appointmentId") || "") || null,
      amount: formData.get("amount") || 0,
      method: String(formData.get("method") || "CASH"),
      paymentDate: String(formData.get("paymentDate") || ""),
      notes: String(formData.get("notes") || "")
    };
    const zRes = PaymentSchema.safeParse(data);
    if (!zRes.success) return getResult(false, 400, null);

    const client = await prisma.client.findFirst({
      where: { id: zRes.data.clientId }
    });
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

    const payment = await prisma.payment.create({
      data: {
        managerId: user.id,
        clientId: zRes.data.clientId,
        appointmentId: zRes.data.appointmentId || null,
        amount: zRes.data.amount,
        method: zRes.data.method,
        paymentDate: new Date(zRes.data.paymentDate),
        notes: zRes.data.notes
      }
    });

    if (payment.appointmentId) {
      await updateAppointmentPaymentStatus(payment.appointmentId);
    }

    await logAudit({
      userId: user.id,
      action: "create_payment",
      entityType: "payment",
      entityId: payment.id,
      description: `Added payment ${payment.id}`
    });

    revalidatePath("/payments");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return getResult(true, 200, payment.id);
  } catch {
    return getResult(false, 500, null);
  }
}

export async function deletePaymentAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401, null);

    const id = String(formData.get("id") || "");
    const existing = await prisma.payment.findFirst({ where: { id } });
    if (!existing) return getResult(false, 404, null);
    if (!scopeId(user, existing.managerId)) return getResult(false, 403, null);

    await prisma.payment.delete({ where: { id } });

    if (existing.appointmentId) {
      await updateAppointmentPaymentStatus(existing.appointmentId);
    }

    await logAudit({
      userId: user.id,
      action: "delete_payment",
      entityType: "payment",
      entityId: id,
      description: `Deleted payment ${id}`
    });

    revalidatePath("/payments");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return getResult(true, 200, id);
  } catch {
    return getResult(false, 500, null);
  }
}
