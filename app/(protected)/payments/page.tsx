import { prisma } from "@/app/_lib/constants/prisma";
import { getCsrfToken } from "@/app/_lib/serverFunctions/csrf";
import { scopeWhere } from "@/app/_lib/serverFunctions/rbac";
import { User } from "@/app/_prisma/client";
import { protectedRoute } from "@/app/_lib/serverFunctions/auth";
import PageHeader from "@/app/_components/ui/PageHeader";
import EmptyState from "@/app/_components/ui/EmptyState";
import { deletePaymentAction } from "@/app/_lib/serverActions/payment";
import { PaymentMethod } from "@/app/_prisma/enums";
import { getActiveLanguage } from "@/app/_lib/serverFunctions/locale";
import { LOCALE } from "@/app/_lib/constants/general";
import { formatDate } from "@/app/_lib/functions/date";

interface PageProps {
  user: User;
  searchParams?: Promise<{
    date?: string;
    clientId?: string;
    method?: PaymentMethod;
  }>;
}

export default protectedRoute(Page);
async function Page({ user, searchParams }: PageProps) {
  const csrfToken = await getCsrfToken();
  const scope = scopeWhere(user);
  const language = await getActiveLanguage(user.language);
  const locale = LOCALE[language];

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const dateFilter = resolvedSearchParams?.date;
  const clientFilter = resolvedSearchParams?.clientId;
  const methodFilter = resolvedSearchParams?.method;

  const dateRange = dateFilter
    ? {
        gte: new Date(`${dateFilter}T00:00:00`),
        lte: new Date(`${dateFilter}T23:59:59`)
      }
    : undefined;

  const [payments, clients, appointments] = await Promise.all([
    prisma.payment.findMany({
      where: {
        ...scope,
        paymentDate: dateRange,
        clientId: clientFilter || undefined,
        method: methodFilter || undefined
      },
      include: { client: true },
      orderBy: { paymentDate: "desc" }
    }),
    prisma.client.findMany({ where: { ...scope }, orderBy: { lastName: "asc" } }),
    prisma.appointment.findMany({
      where: { ...scope },
      include: { client: true },
      orderBy: { startAt: "desc" }
    })
  ]);

  const totalAmount = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Track incoming money"
        actions={
          <a
            href="/api/payments/export"
            className="rounded-md border px-3 py-2 text-sm"
          >
            Export CSV
          </a>
        }
      />

      <form className="flex flex-wrap items-center gap-2">
        <input
          name="date"
          type="date"
          defaultValue={dateFilter || ""}
          className="rounded-md border px-3 py-2 text-sm"
        />
        <select name="clientId" defaultValue={clientFilter || ""} className="rounded-md border px-3 py-2 text-sm">
          <option value="">All clients</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.firstName} {client.lastName}
            </option>
          ))}
        </select>
        <select name="method" defaultValue={methodFilter || ""} className="rounded-md border px-3 py-2 text-sm">
          <option value="">All methods</option>
          {Object.values(PaymentMethod).map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md border px-3 py-2 text-sm">
          Filter
        </button>
        <div className="ml-auto text-sm font-medium">Total: ${totalAmount.toFixed(2)}</div>
      </form>

      {payments.length === 0 ? (
        <EmptyState title="No payments yet" />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t">
                  <td className="px-4 py-3">
                    {payment.client.firstName} {payment.client.lastName}
                  </td>
                  <td className="px-4 py-3">${Number(payment.amount).toFixed(2)}</td>
                  <td className="px-4 py-3">{payment.method}</td>
                  <td className="px-4 py-3">
                    {formatDate(payment.paymentDate, locale)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deletePaymentAction}>
                      <input type="hidden" name="csrfToken" value={csrfToken} />
                      <input type="hidden" name="id" value={payment.id} />
                      <button type="submit" className="text-sm text-destructive">
                        Delete
                      </button>
                    </form>
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
