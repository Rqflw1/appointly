import { prisma } from "@/app/_lib/constants/prisma";
import { getCsrfToken } from "@/app/_lib/serverFunctions/csrf";
import { User } from "@/app/_prisma/client";
import { protectedRoute, requireAdmin } from "@/app/_lib/serverFunctions/auth";
import PageHeader from "@/app/_components/ui/PageHeader";
import EmptyState from "@/app/_components/ui/EmptyState";
import { createUserAction, deleteUserAction, updateUserAction } from "@/app/_lib/serverActions/user";
import { UserRole } from "@/app/_prisma/enums";

interface PageProps {
  user: User;
}

export default protectedRoute(Page);
async function Page({ user }: PageProps) {
  requireAdmin(user);
  const csrfToken = await getCsrfToken();

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage roles and access"
        actions={
          <form action={createUserAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="csrfToken" value={csrfToken} />
            <input
              name="name"
              placeholder="Name"
              required
              className="rounded-md border px-3 py-2 text-sm"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="rounded-md border px-3 py-2 text-sm"
            />
            <input
              name="password"
              type="password"
              placeholder="Temp password"
              required
              className="rounded-md border px-3 py-2 text-sm"
            />
            <select name="role" className="rounded-md border px-3 py-2 text-sm">
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Add user
            </button>
          </form>
        }
      />

      {users.length === 0 ? (
        <EmptyState title="No users" />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3">{row.role}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <form action={updateUserAction} className="flex items-center gap-2">
                        <input type="hidden" name="csrfToken" value={csrfToken} />
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="name" value={row.name} />
                        <input type="hidden" name="email" value={row.email} />
                        <select
                          name="role"
                          defaultValue={row.role}
                          className="rounded-md border px-2 py-1 text-xs"
                        >
                          {Object.values(UserRole).map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="text-xs text-primary">
                          Save
                        </button>
                      </form>
                      <form action={deleteUserAction}>
                        <input type="hidden" name="csrfToken" value={csrfToken} />
                        <input type="hidden" name="id" value={row.id} />
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
