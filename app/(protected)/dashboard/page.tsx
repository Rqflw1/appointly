import { getDashboardStats } from "@/app/_lib/serverFunctions/dashboard";
import { protectedRoute } from "@/app/_lib/serverFunctions/auth";
import { User } from "@/app/_prisma/client";
import StatCard from "@/app/_components/ui/StatCard";
import IncomeChart from "@/app/_components/dashboard/IncomeChart";
import PageHeader from "@/app/_components/ui/PageHeader";
import { formatNumber } from "@/app/_lib/functions/general";

interface ComponentProps {
  user: User;
}

export default protectedRoute(Page);
async function Page({ user }: ComponentProps) {
  const stats = await getDashboardStats(user);
  const incomeMap = new Map<string, number>();

  stats.incomeByDay.forEach((payment) => {
    const key = payment.paymentDate.toISOString().slice(0, 10);
    incomeMap.set(key, (incomeMap.get(key) || 0) + Number(payment.amount));
  });

  const last7 = Array.from({ length: 7 }).map((_, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - idx));
    const key = date.toISOString().slice(0, 10);
    return {
      date: key.slice(5),
      amount: incomeMap.get(key) || 0
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Quick overview of your business"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total clients" value={stats.clientsCount} />
        <StatCard title="Appointments today" value={stats.todayAppointments} />
        <StatCard title="Unpaid appointments" value={stats.unpaidAppointments} />
        <StatCard
          title="Income this month"
          value={`$${formatNumber(Number(stats.monthIncome))}`}
        />
        <StatCard
          title="Income today"
          value={`$${formatNumber(Number(stats.todayIncome))}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <IncomeChart data={last7} />
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 text-sm font-medium">Upcoming appointments</div>
          <div className="space-y-2">
            {stats.upcomingAppointments.length === 0 ? (
              <div className="text-sm text-muted-foreground">No upcoming</div>
            ) : (
              stats.upcomingAppointments.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">
                      {item.client.firstName} {item.client.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.service.title}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.startAt.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 text-sm font-medium">Overdue payments</div>
          <div className="space-y-2">
            {stats.overduePayments.length === 0 ? (
              <div className="text-sm text-muted-foreground">No overdue</div>
            ) : (
              stats.overduePayments.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">
                      {item.client.firstName} {item.client.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.service.title}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.startAt.toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="mb-3 text-sm font-medium">Recent activity</div>
        <div className="space-y-2">
          {stats.auditLogs.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent activity</div>
          ) : (
            stats.auditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{log.action}</div>
                  <div className="text-xs text-muted-foreground">
                    {log.user.email}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {log.createdAt.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
