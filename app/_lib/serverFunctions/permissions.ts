import "server-only";

import { prisma } from "@/app/_lib/constants/prisma";
import { Permission } from "@/app/_prisma/enums";
import { User } from "@/app/_prisma/browser";
import { rolePermissions } from "../constants/permissions";

export async function hasPermission(
  user: User,
  companyId: string,
  permission: Permission
) {
  const companyUser = await prisma.companyUser.findFirst({
    where: { userId: user.id, companyId },
    include: { company: true }
  });
  if (!companyUser) return false;

  return (
    rolePermissions
      .find(({ role }) => role == companyUser.role)
      ?.permissions.includes(permission) ?? false
  );
}
