import "server-only";

import { prisma } from "@/app/_lib/constants/prisma";
import { PaymentStatus } from "@/app/_prisma/enums";
import { User } from "@/app/_prisma/client";

export async function syncDebtRemindersForUser(user: User) {
  const unpaidAppointments = await prisma.appointment.findMany({
    where: {
      managerId: user.id,
      status: { not: "CANCELLED" },
      paymentStatus: { in: [PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID] }
    },
    include: { client: true }
  });

  if (unpaidAppointments.length === 0) return 0;

  const existingDebt = await prisma.reminder.findMany({
    where: {
      managerId: user.id,
      appointmentId: { in: unpaidAppointments.map((a) => a.id) },
      type: "DEBT",
      status: "PENDING"
    },
    select: { appointmentId: true }
  });
  const existingSet = new Set(existingDebt.map((r) => r.appointmentId));
  const toCreate = unpaidAppointments.filter((a) => !existingSet.has(a.id));
  const updates = unpaidAppointments.filter((a) => existingSet.has(a.id));

  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map((a) =>
        prisma.reminder.updateMany({
          where: {
            managerId: a.managerId,
            appointmentId: a.id,
            type: "DEBT",
            status: "PENDING"
          },
          data: {
            remindAt: new Date(a.startAt.getTime() + 7 * 24 * 60 * 60 * 1000),
            message: `Unpaid balance for ${a.client.firstName} ${a.client.lastName}`
          }
        })
      )
    );
  }

  if (toCreate.length > 0) {
    await prisma.reminder.createMany({
      data: toCreate.map((a) => ({
        managerId: a.managerId,
        clientId: a.clientId,
        appointmentId: a.id,
        type: "DEBT",
        remindAt: new Date(a.startAt.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: "PENDING",
        message: `Unpaid balance for ${a.client.firstName} ${a.client.lastName}`
      }))
    });
  }

  return toCreate.length + updates.length;
}
