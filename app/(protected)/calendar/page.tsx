import { prisma } from "@/app/_lib/constants/prisma";
import { scopeWhere } from "@/app/_lib/serverFunctions/rbac";
import { User } from "@/app/_prisma/client";
import { protectedRoute } from "@/app/_lib/serverFunctions/auth";
import PageHeader from "@/app/_components/ui/PageHeader";
import EmptyState from "@/app/_components/ui/EmptyState";
import CalendarDateForm from "@/app/_components/calendar/CalendarDateForm";
import { getActiveLanguage } from "@/app/_lib/serverFunctions/locale";
import { getDictionary } from "@/app/_lib/functions/general";

export const dynamic = "force-dynamic";

interface PageProps {
  user: User;
  searchParams?: Promise<{ from?: string; to?: string }>;
}

function normalizeDate(input?: string) {
  if (!input) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const match = input.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return "";
}

export default protectedRoute(Page);
async function Page({ user, searchParams }: PageProps) {
  const scope = scopeWhere(user);
  const language = await getActiveLanguage(user.language);
  const dict = getDictionary(language);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const normalizedFrom = normalizeDate(resolvedSearchParams?.from);
  const normalizedTo = normalizeDate(resolvedSearchParams?.to);
  const today = new Date().toISOString().slice(0, 10);
  const from = normalizedFrom || today;
  const to = normalizedTo || from;
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T23:59:59`);

  const appointments = await prisma.appointment.findMany({
    where: { ...scope, startAt: { gte: start, lte: end } },
    include: { client: true, service: true },
    orderBy: { startAt: "asc" }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.labels.calendar}
        description={dict.labels.calendarDesc}
      />

      <CalendarDateForm from={from} to={to} />

      {appointments.length === 0 ? (
        <EmptyState title={dict.empty.appointments} />
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
