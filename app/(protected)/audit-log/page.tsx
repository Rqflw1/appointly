import { prisma } from "@/app/_lib/constants/prisma";
import { User } from "@/app/_prisma/client";
import { protectedRoute, requireAdmin } from "@/app/_lib/serverFunctions/auth";
import PageHeader from "@/app/_components/ui/PageHeader";
import EmptyState from "@/app/_components/ui/EmptyState";

interface PageProps {
  user: User;
}

export default protectedRoute(Page);
async function Page({ user }: PageProps) {
  requireAdmin(user);
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: true }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Audit log" description="Recent actions" />

      {logs.length === 0 ? (
        <EmptyState title="No audit events yet" />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="px-4 py-3">{log.user.email}</td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3">
                    {log.entityType} {log.entityId || ""}
                  </td>
                  <td className="px-4 py-3">{log.ipAddress}</td>
                  <td className="px-4 py-3">
                    {log.createdAt.toLocaleString()}
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
