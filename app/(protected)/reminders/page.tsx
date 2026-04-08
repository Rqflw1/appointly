import { prisma } from "@/app/_lib/constants/prisma";
import { getCsrfToken } from "@/app/_lib/serverFunctions/csrf";
import { scopeWhere } from "@/app/_lib/serverFunctions/rbac";
import { User } from "@/app/_prisma/client";
import { protectedRoute } from "@/app/_lib/serverFunctions/auth";
import PageHeader from "@/app/_components/ui/PageHeader";
import EmptyState from "@/app/_components/ui/EmptyState";
import {
  createReminderAction,
  deleteReminderAction,
  markReminderSentAction
} from "@/app/_lib/serverActions/reminder";
import { ReminderStatus, ReminderType } from "@/app/_prisma/enums";
import { cn } from "@/app/_shadcn/lib/utils";

interface PageProps {
  user: User;
}

export default protectedRoute(Page);
async function Page({ user }: PageProps) {
  const csrfToken = await getCsrfToken();
  const scope = scopeWhere(user);

  const [reminders, clients, appointments] = await Promise.all([
    prisma.reminder.findMany({
      where: { ...scope },
      include: { client: true },
      orderBy: { remindAt: "asc" }
    }),
    prisma.client.findMany({ where: { ...scope }, orderBy: { lastName: "asc" } }),
    prisma.appointment.findMany({
      where: { ...scope },
      include: { client: true },
      orderBy: { startAt: "desc" }
    })
  ]);

  const now = new Date();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reminders"
        description="Keep clients informed"
        actions={
          <form action={createReminderAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="csrfToken" value={csrfToken} />
            <select name="clientId" required className="rounded-md border px-3 py-2 text-sm">
              <option value="">Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName}
                </option>
              ))}
            </select>
            <select name="appointmentId" className="rounded-md border px-3 py-2 text-sm">
              <option value="">Appointment (optional)</option>
              {appointments.map((appt) => (
                <option key={appt.id} value={appt.id}>
                  {appt.client.firstName} {appt.client.lastName} · {new Date(appt.startAt).toLocaleDateString()}
                </option>
              ))}
            </select>
            <select name="type" className="rounded-md border px-3 py-2 text-sm">
              {Object.values(ReminderType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              name="remindAt"
              type="datetime-local"
              required
              className="rounded-md border px-3 py-2 text-sm"
            />
            <input
              name="message"
              placeholder="Message"
              required
              className="w-64 rounded-md border px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Add
            </button>
          </form>
        }
      />

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
                      {reminder.remindAt.toLocaleString()}
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
