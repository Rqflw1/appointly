"use server";

import { prisma } from "@/app/_lib/constants/prisma";
import { getResult } from "@/app/_lib/functions/general";
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
