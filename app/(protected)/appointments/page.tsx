import { prisma } from "@/app/_lib/constants/prisma";
import { getCsrfToken } from "@/app/_lib/serverFunctions/csrf";
import { scopeWhere } from "@/app/_lib/serverFunctions/rbac";
import { User } from "@/app/_prisma/client";
import { protectedRoute } from "@/app/_lib/serverFunctions/auth";
import PageHeader from "@/app/_components/ui/PageHeader";
import EmptyState from "@/app/_components/ui/EmptyState";
import { deleteAppointmentAction, updateAppointmentAction } from "@/app/_lib/serverActions/appointment";
import { AppointmentStatus, PaymentStatus } from "@/app/_prisma/enums";
import AppointmentCreateForm from "@/app/_components/appointments/AppointmentCreateForm";
import { getActiveLanguage } from "@/app/_lib/serverFunctions/locale";
import { LOCALE } from "@/app/_lib/constants/general";
import { formatDateTime } from "@/app/_lib/functions/date";

interface PageProps {
  user: User;
  searchParams?: {
    date?: string;
    status?: AppointmentStatus;
    paymentStatus?: PaymentStatus;
  };
}

export default protectedRoute(Page);
async function Page({ user, searchParams }: PageProps) {
  const csrfToken = await getCsrfToken();
  const scope = scopeWhere(user);
  const language = await getActiveLanguage(user.language);
  const locale = LOCALE[language];

  const resolvedSearchParams = (searchParams as any) ? await (searchParams as any) : undefined;
  const dateFilter = resolvedSearchParams?.date;
  const statusFilter = resolvedSearchParams?.status;
  const paymentFilter = resolvedSearchParams?.paymentStatus;

  const dateRange = dateFilter
    ? {
        gte: new Date(`${dateFilter}T00:00:00`),
        lte: new Date(`${dateFilter}T23:59:59`)
      }
    : undefined;

  const [appointments, clients, services, availabilityAppointments] =
    await Promise.all([
    prisma.appointment.findMany({
      where: {
        ...scope,
        startAt: dateRange,
        status: statusFilter || undefined,
        paymentStatus: paymentFilter || undefined
      },
      include: { client: true, service: true },
      orderBy: { startAt: "desc" }
    }),
    prisma.client.findMany({ where: { ...scope }, orderBy: { lastName: "asc" } }),
    prisma.service.findMany({ where: { ...scope }, orderBy: { title: "asc" } }),
    prisma.appointment.findMany({
      where: { ...scope },
      select: { startAt: true, durationMinutes: true }
    })
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Plan and track meetings"
        actions={
          <AppointmentCreateForm
            csrfToken={csrfToken}
            clients={clients.map((client) => ({
              id: client.id,
              firstName: client.firstName,
              lastName: client.lastName
            }))}
            services={services.map((service) => ({
              id: service.id,
              title: service.title,
              price: String(service.price),
              durationMinutes: service.durationMinutes
            }))}
            existingAppointments={availabilityAppointments.map((appt) => ({
              startAt: appt.startAt.toISOString(),
              durationMinutes: appt.durationMinutes
            }))}
            workdayStart={user.workdayStart || "08:00"}
            workdayEnd={user.workdayEnd || "18:00"}
          />
        }
      />

      <form className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[0.6fr_1fr_1fr_auto]">
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Date</div>
            <input
              name="date"
              type="date"
              defaultValue={dateFilter || ""}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">
              Status
            </div>
            <select
              name="status"
              defaultValue={statusFilter || ""}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              {Object.values(AppointmentStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">
              Payment
            </div>
            <select
              name="paymentStatus"
              defaultValue={paymentFilter || ""}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">All payments</option>
              {Object.values(PaymentStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              Filter
            </button>
          </div>
        </div>
      </form>

      {appointments.length === 0 ? (
        <EmptyState title="No appointments yet" />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id} className="border-t">
                  <td className="px-4 py-3">
                    {appt.client.firstName} {appt.client.lastName}
                  </td>
                  <td className="px-4 py-3">{appt.service.title}</td>
                  <td className="px-4 py-3">
                    {formatDateTime(appt.startAt, locale)}
                  </td>
                  <td className="px-4 py-3">{appt.status}</td>
                  <td className="px-4 py-3">{appt.paymentStatus}</td>
                  <td className="px-4 py-3">${Number(appt.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <form action={updateAppointmentAction} className="flex items-center gap-2">
                        <input type="hidden" name="csrfToken" value={csrfToken} />
                        <input type="hidden" name="id" value={appt.id} />
                        <input type="hidden" name="clientId" value={appt.clientId} />
                        <input type="hidden" name="serviceId" value={appt.serviceId} />
                        <input
                          type="hidden"
                          name="startAt"
                          value={appt.startAt.toISOString()}
                        />
                        <input
                          type="hidden"
                          name="durationMinutes"
                          value={appt.durationMinutes}
                        />
        <input type="hidden" name="price" value={Number(appt.price)} />
                        <input type="hidden" name="notes" value={appt.notes} />
                        <select
                          name="status"
                          defaultValue={appt.status}
                          className="rounded-md border px-2 py-1 text-xs"
                        >
                          {Object.values(AppointmentStatus).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <select
                          name="paymentStatus"
                          defaultValue={appt.paymentStatus}
                          className="rounded-md border px-2 py-1 text-xs"
                        >
                          {Object.values(PaymentStatus).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="text-xs text-primary">
                          Save
                        </button>
                      </form>
                      <form action={deleteAppointmentAction}>
                        <input type="hidden" name="csrfToken" value={csrfToken} />
                        <input type="hidden" name="id" value={appt.id} />
                        <button type="submit" className="text-xs text-destructive">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
