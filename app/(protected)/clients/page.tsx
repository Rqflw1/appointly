import { prisma } from "@/app/_lib/constants/prisma";
import { getCsrfToken } from "@/app/_lib/serverFunctions/csrf";
import { scopeWhere } from "@/app/_lib/serverFunctions/rbac";
import { User } from "@/app/_prisma/client";
import { protectedRoute } from "@/app/_lib/serverFunctions/auth";
import PageHeader from "@/app/_components/ui/PageHeader";
import EmptyState from "@/app/_components/ui/EmptyState";
import Link from "next/link";
import { createClientAction, deleteClientAction } from "@/app/_lib/serverActions/client";

interface PageProps {
  user: User;
  searchParams?: Promise<{ q?: string }>;
}

export default protectedRoute(Page);
async function Page({ user, searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const q = resolvedSearchParams?.q?.trim() || "";
  const csrfToken = await getCsrfToken();
  const scope = scopeWhere(user);

  const clients = await prisma.client.findMany({
    where: {
      ...scope,
      OR: q
        ? [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } }
          ]
        : undefined
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage your client base"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <form action={createClientAction} className="flex flex-wrap gap-2">
              <input type="hidden" name="csrfToken" value={csrfToken} />
              <input
                name="firstName"
                placeholder="First name"
                required
                className="rounded-md border px-3 py-2 text-sm"
              />
              <input
                name="lastName"
                placeholder="Last name"
                required
                className="rounded-md border px-3 py-2 text-sm"
              />
              <input
                name="phone"
                placeholder="Phone"
                className="rounded-md border px-3 py-2 text-sm"
              />
              <input
                name="email"
                placeholder="Email"
                type="email"
                className="rounded-md border px-3 py-2 text-sm"
              />
              <input
                name="notes"
                placeholder="Notes"
                className="rounded-md border px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Add client
              </button>
            </form>
            <Link
              href="/api/clients/export"
              className="rounded-md border px-3 py-2 text-sm"
            >
              Export CSV
            </Link>
          </div>
        }
      />

      <form className="flex items-center gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name, phone or email"
          className="w-full max-w-md rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md border px-3 py-2 text-sm"
        >
          Search
        </button>
      </form>

      {clients.length === 0 ? (
        <EmptyState title="No clients yet" />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {client.firstName} {client.lastName}
                    </div>
                  </td>
                  <td className="px-4 py-3">{client.phone || "—"}</td>
                  <td className="px-4 py-3">{client.email || "—"}</td>
                  <td className="px-4 py-3">
                    {client.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/clients/${client.id}`}
                        className="text-sm text-primary"
                      >
                        View
                      </Link>
                      <form action={deleteClientAction}>
                        <input type="hidden" name="csrfToken" value={csrfToken} />
                        <input type="hidden" name="id" value={client.id} />
                        <button
                          type="submit"
                          className="text-sm text-destructive"
                        >
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
