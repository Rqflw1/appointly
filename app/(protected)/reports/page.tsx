import { prisma } from "@/app/_lib/constants/prisma";
import { scopeWhere } from "@/app/_lib/serverFunctions/rbac";
import { User } from "@/app/_prisma/client";
import { protectedRoute } from "@/app/_lib/serverFunctions/auth";
import PageHeader from "@/app/_components/ui/PageHeader";
import ReportsCharts from "@/app/_components/reports/ReportsCharts";
import { AppointmentStatus, PaymentMethod } from "@/app/_prisma/enums";

interface PageProps {
  user: User;
  searchParams?: { from?: string; to?: string };
}

export default protectedRoute(Page);
async function Page({ user, searchParams }: PageProps) {
  const scope = scopeWhere(user);
  const from = searchParams?.from
    ? new Date(`${searchParams.from}T00:00:00`)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const to = searchParams?.to
    ? new Date(`${searchParams.to}T23:59:59`)
    : new Date();

  const [payments, appointments, clientsCount, newClients] = await Promise.all([
    prisma.payment.findMany({
      where: { ...scope, paymentDate: { gte: from, lte: to } }
    }),
    prisma.appointment.findMany({
      where: { ...scope, startAt: { gte: from, lte: to } }
    }),
    prisma.client.count({ where: { ...scope } }),
    prisma.client.count({ where: { ...scope, createdAt: { gte: from, lte: to } } })
  ]);

  const incomeByDayMap = new Map<string, number>();
  const paymentMethodMap = new Map<string, number>();

  payments.forEach((payment) => {
    const key = payment.paymentDate.toISOString().slice(0, 10);
    incomeByDayMap.set(key, (incomeByDayMap.get(key) || 0) + Number(payment.amount));

    paymentMethodMap.set(
      payment.method,
      (paymentMethodMap.get(payment.method) || 0) + Number(payment.amount)
    );
  });

  const incomeByDay = Array.from(incomeByDayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, amount]) => ({ date: date.slice(5), amount }));

  const methodData = Object.values(PaymentMethod).map((method) => ({
    name: method,
    value: paymentMethodMap.get(method) || 0
  }));

  const completedCount = appointments.filter(
    (appt) => appt.status === AppointmentStatus.COMPLETED
  ).length;
  const cancelledCount = appointments.filter(
    (appt) => appt.status === AppointmentStatus.CANCELLED
  ).length;

  const topServices = await prisma.appointment.groupBy({
    by: ["serviceId"],
    where: { ...scope, startAt: { gte: from, lte: to } },
    _sum: { price: true },
    orderBy: { _sum: { price: "desc" } },
    take: 5
  });
  const serviceMap = new Map(
    (
      await prisma.service.findMany({
        where: { id: { in: topServices.map((row) => row.serviceId) } }
      })
    ).map((service) => [service.id, service.title])
  );

  const topClients = await prisma.payment.groupBy({
    by: ["clientId"],
    where: { ...scope, paymentDate: { gte: from, lte: to } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 5
  });
  const clientMap = new Map(
    (
      await prisma.client.findMany({
        where: { id: { in: topClients.map((row) => row.clientId) } }
      })
    ).map((client) => [client.id, `${client.firstName} ${client.lastName}`])
  );

  const unpaidTotal = appointments.reduce((sum, appt) => {
    const paid = payments
      .filter((payment) => payment.appointmentId === appt.id)
      .reduce((sub, payment) => sub + Number(payment.amount), 0);
    const diff = Number(appt.price) - paid;
    return sum + (diff > 0 ? diff : 0);
  }, 0);

  const totalIncome = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Business insights" />

      <form className="flex flex-wrap items-center gap-2">
        <input
          name="from"
          type="date"
          defaultValue={searchParams?.from || ""}
          className="rounded-md border px-3 py-2 text-sm"
        />
        <input
          name="to"
          type="date"
          defaultValue={searchParams?.to || ""}
          className="rounded-md border px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md border px-3 py-2 text-sm">
          Apply
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-muted-foreground">Income</div>
          <div className="mt-2 text-2xl font-semibold">${totalIncome.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-muted-foreground">Clients</div>
          <div className="mt-2 text-2xl font-semibold">{clientsCount}</div>
          <div className="text-xs text-muted-foreground">New: {newClients}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-muted-foreground">Unpaid total</div>
          <div className="mt-2 text-2xl font-semibold">${unpaidTotal.toFixed(2)}</div>
        </div>
      </div>

      <ReportsCharts income={incomeByDay} methods={methodData} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 text-sm font-medium">Top services</div>
          <div className="space-y-2">
            {topServices.length === 0 ? (
              <div className="text-sm text-muted-foreground">No data</div>
            ) : (
              topServices.map((row) => (
                <div key={row.serviceId} className="flex items-center justify-between">
                  <div className="text-sm">{serviceMap.get(row.serviceId)}</div>
                  <div className="text-sm font-medium">${Number(row._sum.price || 0).toFixed(2)}</div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 text-sm font-medium">Top clients</div>
          <div className="space-y-2">
            {topClients.length === 0 ? (
              <div className="text-sm text-muted-foreground">No data</div>
            ) : (
              topClients.map((row) => (
                <div key={row.clientId} className="flex items-center justify-between">
                  <div className="text-sm">{clientMap.get(row.clientId)}</div>
                  <div className="text-sm font-medium">${Number(row._sum.amount || 0).toFixed(2)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="mb-3 text-sm font-medium">Appointments status</div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>Completed: {completedCount}</div>
          <div>Cancelled: {cancelledCount}</div>
        </div>
      </div>
    </div>
  );
}
