import "server-only";

import { headers } from "next/headers";
import { prisma } from "@/app/_lib/constants/prisma";

export async function logAudit(params: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  description: string;
}) {
  if (!params.userId) return;
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { id: true }
  });
  if (!user) return;
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";

  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        description: params.description,
        ipAddress: ip
      }
    });
  } catch (error) {
    const code = (error as { code?: string } | null)?.code;
    if (code === "P2003") return;
    throw error;
  }
}
