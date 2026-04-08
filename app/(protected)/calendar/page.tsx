import { prisma } from "@/app/_lib/constants/prisma";
import { scopeWhere } from "@/app/_lib/serverFunctions/rbac";
import { User } from "@/app/_prisma/client";
import { protectedRoute } from "@/app/_lib/serverFunctions/auth";
import PageHeader from "@/app/_components/ui/PageHeader";
import EmptyState from "@/app/_components/ui/EmptyState";

interface PageProps {
  user: User;
  searchParams?: { date?: string };
}

export default protectedRoute(Page);
async function Page({ user, searchParams }: PageProps) {
  const scope = scopeWhere(user);
  const date = searchParams?.date || new Date().toISOString().slice(0, 10);
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59`);

  const appointments = await prisma.appointment.findMany({
    where: { ...scope, startAt: { gte: start, lte: end } },
    include: { client: true, service: true },
    orderBy: { startAt: "asc" }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" description="Daily schedule" />

      <form className="flex items-center gap-2">
        <input
          type="date"
          name="date"
          defaultValue={date}
          className="rounded-md border px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md border px-3 py-2 text-sm">
          Go
        </button>
      </form>

      {appointments.length === 0 ? (
        <EmptyState title="No appointments on this day" />
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <div key={appt.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    {appt.client.firstName} {appt.client.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {appt.service.title}
                  </div>
                </div>
                <div className="text-sm">{appt.startAt.toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
