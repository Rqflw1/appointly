import "server-only";

import { User } from "@/app/_prisma/client";
import { UserRole } from "@/app/_prisma/enums";

export function scopeWhere(user: User, field: string = "managerId") {
  if (user.role === UserRole.ADMIN) return {} as Record<string, string>;
  return { [field]: user.id } as Record<string, string>;
}

export function scopeId(user: User, managerId: string) {
  if (user.role === UserRole.ADMIN) return true;
  return managerId === user.id;
}
