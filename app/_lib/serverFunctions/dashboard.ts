import "server-only";

import { prisma } from "@/app/_lib/constants/prisma";
import { User } from "@/app/_prisma/client";
import { scopeWhere } from "./rbac";
import { endOfDay, startOfDay, startOfMonth, startOfWeek } from "../functions/date";
import { PaymentStatus, UserRole } from "@/app/_prisma/enums";

export async function getDashboardStats(user: User) {
  const scope = scopeWhere(user);
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);

  const [clientsCount, todayAppointments, unpaidAppointments, monthIncome] =
    await Promise.all([
      prisma.client.count({ where: scope }),
      prisma.appointment.count({
        where: {
          ...scope,
          startAt: { gte: todayStart, lte: todayEnd }
        }
      }),
      prisma.appointment.count({
        where: { ...scope, paymentStatus: PaymentStatus.UNPAID }
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { ...scope, paymentDate: { gte: monthStart } }
      })
    ]);

  const todayIncome = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { ...scope, paymentDate: { gte: todayStart, lte: todayEnd } }
  });

  const upcomingAppointments = await prisma.appointment.findMany({
    where: { ...scope, startAt: { gte: now } },
    include: { client: true, service: true },
    orderBy: { startAt: "asc" },
    take: 5
  });

  const overduePayments = await prisma.appointment.findMany({
    where: {
      ...scope,
      paymentStatus: PaymentStatus.UNPAID,
      startAt: { lt: now }
    },
    include: { client: true, service: true },
    orderBy: { startAt: "desc" },
    take: 5
  });

  const weekStart = startOfWeek(now);
  const incomeByDay = await prisma.payment.findMany({
    where: { ...scope, paymentDate: { gte: weekStart } },
    orderBy: { paymentDate: "asc" }
  });

  const auditLogs = await prisma.auditLog.findMany({
    where: user.role === UserRole.ADMIN ? {} : { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { user: true }
  });

  return {
    clientsCount,
    todayAppointments,
    unpaidAppointments,
    monthIncome: monthIncome._sum.amount ?? 0,
    todayIncome: todayIncome._sum.amount ?? 0,
    upcomingAppointments,
    overduePayments,
    incomeByDay,
    auditLogs
  };
}
