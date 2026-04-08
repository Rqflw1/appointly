import { prisma } from "@/app/_lib/constants/prisma";
import { getCsrfToken } from "@/app/_lib/serverFunctions/csrf";
import { scopeWhere } from "@/app/_lib/serverFunctions/rbac";
import { User } from "@/app/_prisma/client";
import { protectedRoute } from "@/app/_lib/serverFunctions/auth";
import PageHeader from "@/app/_components/ui/PageHeader";
import EmptyState from "@/app/_components/ui/EmptyState";
import {
  deleteReminderAction,
  markReminderSentAction
} from "@/app/_lib/serverActions/reminder";
import { ReminderStatus } from "@/app/_prisma/enums";
import { cn } from "@/app/_shadcn/lib/utils";
import { syncDebtRemindersForUser } from "@/app/_lib/serverFunctions/reminders";
import { getActiveLanguage } from "@/app/_lib/serverFunctions/locale";
import { LOCALE } from "@/app/_lib/constants/general";
import { formatDateTime } from "@/app/_lib/functions/date";

interface PageProps {
  user: User;
  searchParams?: Promise<{ from?: string; to?: string }>;
}

export default protectedRoute(Page);
async function Page({ user, searchParams }: PageProps) {
  const csrfToken = await getCsrfToken();
  const scope = scopeWhere(user);
  const language = await getActiveLanguage(user.language);
  const locale = LOCALE[language];

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const from = resolvedSearchParams?.from
    ? new Date(`${resolvedSearchParams.from}T00:00:00`)
    : undefined;
  const to = resolvedSearchParams?.to
    ? new Date(`${resolvedSearchParams.to}T23:59:59`)
    : undefined;

  const remindAtFilter =
    from || to
      ? {
          gte: from || undefined,
          lte: to || undefined
        }
      : undefined;

  await syncDebtRemindersForUser(user);

  const [reminders] = await Promise.all([
    prisma.reminder.findMany({
      where: { ...scope, remindAt: remindAtFilter },
      include: { client: true },
      orderBy: { remindAt: "asc" }
    })
  ]);

  const now = new Date();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reminders"
        description="Keep clients informed"
      />

      <div className="flex flex-wrap items-center gap-2">
        <form className="flex flex-wrap items-center gap-2">
          <input
            name="from"
            type="date"
          defaultValue={resolvedSearchParams?.from || ""}
            className="rounded-md border px-3 py-2 text-sm"
          />
          <input
            name="to"
            type="date"
          defaultValue={resolvedSearchParams?.to || ""}
            className="rounded-md border px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-md border px-3 py-2 text-sm">
            Filter
          </button>
        </form>
      </div>

      {reminders.length === 0 ? (
        <EmptyState title="No reminders yet" />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Remind at</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((reminder) => {
                const isOverdue =
                  reminder.status === ReminderStatus.PENDING &&
                  reminder.remindAt < now;
                return (
                  <tr
                    key={reminder.id}
                    className={cn("border-t", isOverdue && "bg-red-50")}
                  >
                    <td className="px-4 py-3">
                      {reminder.client.firstName} {reminder.client.lastName}
                    </td>
                    <td className="px-4 py-3">{reminder.type}</td>
                    <td className="px-4 py-3">
                      {formatDateTime(reminder.remindAt, locale)}
                    </td>
                    <td className="px-4 py-3">{reminder.status}</td>
                    <td className="px-4 py-3">{reminder.message}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {reminder.status === ReminderStatus.PENDING ? (
                          <form action={markReminderSentAction}>
                            <input type="hidden" name="csrfToken" value={csrfToken} />
                            <input type="hidden" name="id" value={reminder.id} />
                            <button type="submit" className="text-sm text-primary">
                              Mark sent
                            </button>
                          </form>
                        ) : null}
                        <form action={deleteReminderAction}>
                          <input type="hidden" name="csrfToken" value={csrfToken} />
                          <input type="hidden" name="id" value={reminder.id} />
                          <button type="submit" className="text-sm text-destructive">
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
