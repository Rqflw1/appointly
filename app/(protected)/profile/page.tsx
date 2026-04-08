import { getCsrfToken } from "@/app/_lib/serverFunctions/csrf";
import { User } from "@/app/_prisma/client";
import { protectedRoute } from "@/app/_lib/serverFunctions/auth";
import PageHeader from "@/app/_components/ui/PageHeader";
import { changePasswordAction, updateProfileAction } from "@/app/_lib/serverActions/user";

interface PageProps {
  user: User;
}

export default protectedRoute(Page);
async function Page({ user }: PageProps) {
  const csrfToken = await getCsrfToken();

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your personal settings" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 text-sm font-medium">Profile</div>
          <form action={updateProfileAction} className="space-y-3">
            <input type="hidden" name="csrfToken" value={csrfToken} />
            <input
              name="name"
              defaultValue={user.name}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
            <input
              name="email"
              type="email"
              defaultValue={user.email}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                name="workdayStart"
                type="time"
                defaultValue={user.workdayStart || "08:00"}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
              <input
                name="workdayEnd"
                type="time"
                defaultValue={user.workdayEnd || "18:00"}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Save
            </button>
          </form>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 text-sm font-medium">Change password</div>
          <form action={changePasswordAction} className="space-y-3">
            <input type="hidden" name="csrfToken" value={csrfToken} />
            <input
              name="currentPassword"
              type="password"
              placeholder="Current password"
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
            <input
              name="newPassword"
              type="password"
              placeholder="New password"
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Update password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
