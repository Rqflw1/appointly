import { prisma } from "@/app/_lib/constants/prisma";
import { getCsrfToken } from "@/app/_lib/serverFunctions/csrf";
import { scopeWhere } from "@/app/_lib/serverFunctions/rbac";
import { User } from "@/app/_prisma/client";
import { protectedRoute } from "@/app/_lib/serverFunctions/auth";
import PageHeader from "@/app/_components/ui/PageHeader";
import EmptyState from "@/app/_components/ui/EmptyState";
import { createServiceAction, deleteServiceAction, updateServiceAction } from "@/app/_lib/serverActions/service";

interface PageProps {
  user: User;
}

export default protectedRoute(Page);
async function Page({ user }: PageProps) {
  const csrfToken = await getCsrfToken();
  const scope = scopeWhere(user);

  const services = await prisma.service.findMany({
    where: { ...scope },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Your service catalog"
        actions={
          <form action={createServiceAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="csrfToken" value={csrfToken} />
            <input
              name="title"
              placeholder="Title"
              required
              className="rounded-md border px-3 py-2 text-sm"
            />
            <input
              name="description"
              placeholder="Description"
              className="rounded-md border px-3 py-2 text-sm"
            />
            <input
              name="price"
              type="number"
              step="0.01"
              placeholder="Price"
              required
              className="rounded-md border px-3 py-2 text-sm"
            />
            <input
              name="durationMinutes"
              type="number"
              placeholder="Duration (min)"
              required
              className="rounded-md border px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Add service
            </button>
          </form>
        }
      />

      {services.length === 0 ? (
        <EmptyState title="No services yet" />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-t">
                  <td className="px-4 py-3">
                    <form
                      action={updateServiceAction}
                      className="flex flex-col gap-2"
                    >
                      <input type="hidden" name="csrfToken" value={csrfToken} />
                      <input type="hidden" name="id" value={service.id} />
                      <input
                        name="title"
                        defaultValue={service.title}
                        className="rounded-md border px-2 py-1 text-sm"
                        required
                      />
                      <input
                        name="description"
                        defaultValue={service.description}
                        className="rounded-md border px-2 py-1 text-xs"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          name="price"
                          type="number"
                          step="0.01"
                          defaultValue={Number(service.price)}
                          className="w-24 rounded-md border px-2 py-1 text-sm"
                          required
                        />
                        <input
                          name="durationMinutes"
                          type="number"
                          defaultValue={service.durationMinutes}
                          className="w-24 rounded-md border px-2 py-1 text-sm"
                          required
                        />
                        <button type="submit" className="text-xs text-primary">
                          Save
                        </button>
                      </div>
                    </form>
                  </td>
                  <td className="px-4 py-3">${Number(service.price).toFixed(2)}</td>
                  <td className="px-4 py-3">{service.durationMinutes} min</td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteServiceAction}>
                      <input type="hidden" name="csrfToken" value={csrfToken} />
                      <input type="hidden" name="id" value={service.id} />
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
