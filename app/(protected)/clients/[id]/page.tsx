import { prisma } from "@/app/_lib/constants/prisma";
import { getCsrfToken } from "@/app/_lib/serverFunctions/csrf";
import { scopeWhere } from "@/app/_lib/serverFunctions/rbac";
import { User } from "@/app/_prisma/client";
import { protectedRoute } from "@/app/_lib/serverFunctions/auth";
import PageHeader from "@/app/_components/ui/PageHeader";
import { updateClientAction } from "@/app/_lib/serverActions/client";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  user: User;
  params: { id: string };
}

export default protectedRoute(Page);
async function Page({ user, params }: PageProps) {
  const csrfToken = await getCsrfToken();
  const scope = scopeWhere(user);

  const client = await prisma.client.findFirst({
    where: { id: params.id, ...scope },
    include: {
      appointments: {
        include: { service: true },
        orderBy: { startAt: "desc" }
      },
      payments: {
        orderBy: { paymentDate: "desc" }
      }
    }
  });

  if (!client) return notFound();

  const paidTotal = client.payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );
  const appointmentTotal = client.appointments.reduce(
    (sum, appt) => sum + Number(appt.price),
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${client.firstName} ${client.lastName}`}
        description="Client details"
        actions={<Link href="/clients">Back to clients</Link>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 text-sm font-medium">Profile</div>
          <form action={updateClientAction} className="space-y-3">
            <input type="hidden" name="csrfToken" value={csrfToken} />
            <input type="hidden" name="id" value={client.id} />
            <input
              name="firstName"
              defaultValue={client.firstName}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
            <input
              name="lastName"
              defaultValue={client.lastName}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            <input
              name="phone"
              defaultValue={client.phone ?? ""}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Optional"
            />
            <input
              name="email"
              defaultValue={client.email ?? ""}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Optional"
            />
            <textarea
              name="notes"
              defaultValue={client.notes}
              className="w-full rounded-md border px-3 py-2 text-sm"
              rows={4}
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Save
            </button>
          </form>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 text-sm font-medium">Financial summary</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Total billed</span>
              <span className="font-semibold">${appointmentTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total paid</span>
              <span className="font-semibold">${paidTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Outstanding</span>
              <span className="font-semibold">
                ${(appointmentTotal - paidTotal).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 text-sm font-medium">Notes</div>
          <div className="text-sm text-muted-foreground">
            {client.notes || "No notes"}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 text-sm font-medium">Appointments</div>
          <div className="space-y-2">
            {client.appointments.length === 0 ? (
              <div className="text-sm text-muted-foreground">No appointments</div>
            ) : (
              client.appointments.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{appt.service.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {appt.startAt.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm">${Number(appt.price).toFixed(2)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 text-sm font-medium">Payments</div>
          <div className="space-y-2">
            {client.payments.length === 0 ? (
              <div className="text-sm text-muted-foreground">No payments</div>
            ) : (
              client.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">${Number(payment.amount).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      {payment.paymentDate.toLocaleDateString()} · {payment.method}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{payment.notes}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
