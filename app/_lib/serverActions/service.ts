"use server";

import { prisma } from "@/app/_lib/constants/prisma";
import { getResult } from "@/app/_lib/functions/general";
import { ServiceSchema } from "@/app/_lib/validation/service";
import { getSessionAndUser } from "../serverFunctions/auth";
import { scopeId } from "../serverFunctions/rbac";
import { logAudit } from "../serverFunctions/audit";
import { verifyCsrfToken } from "../serverFunctions/csrf";
import { revalidatePath } from "next/cache";

export async function createServiceAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401, null);

    const data = {
      title: String(formData.get("title") || ""),
      description: String(formData.get("description") || ""),
      price: formData.get("price") || 0,
      durationMinutes: formData.get("durationMinutes") || 0
    };
    const zRes = ServiceSchema.safeParse(data);
    if (!zRes.success) return getResult(false, 400, null);

    const service = await prisma.service.create({
      data: { ...zRes.data, managerId: user.id }
    });

    await logAudit({
      userId: user.id,
      action: "create_service",
      entityType: "service",
      entityId: service.id,
      description: `Created service ${service.title}`
    });

    revalidatePath("/services");
    return getResult(true, 200, service.id);
  } catch {
    return getResult(false, 500, null);
  }
}

export async function updateServiceAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401, null);

    const id = String(formData.get("id") || "");
    const data = {
      title: String(formData.get("title") || ""),
      description: String(formData.get("description") || ""),
      price: formData.get("price") || 0,
      durationMinutes: formData.get("durationMinutes") || 0
    };
    const zRes = ServiceSchema.safeParse(data);
    if (!zRes.success) return getResult(false, 400, null);

    const existing = await prisma.service.findFirst({ where: { id } });
    if (!existing) return getResult(false, 404, null);
    if (!scopeId(user, existing.managerId)) return getResult(false, 403, null);

    await prisma.service.update({ where: { id }, data: zRes.data });

    await logAudit({
      userId: user.id,
      action: "update_service",
      entityType: "service",
      entityId: id,
      description: `Updated service ${zRes.data.title}`
    });

    revalidatePath("/services");
    return getResult(true, 200, id);
  } catch {
    return getResult(false, 500, null);
  }
}

export async function deleteServiceAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401, null);

    const id = String(formData.get("id") || "");
    const existing = await prisma.service.findFirst({ where: { id } });
    if (!existing) return getResult(false, 404, null);
    if (!scopeId(user, existing.managerId)) return getResult(false, 403, null);

    await prisma.service.delete({ where: { id } });

    await logAudit({
      userId: user.id,
      action: "delete_service",
      entityType: "service",
      entityId: id,
      description: `Deleted service ${existing.title}`
    });

    revalidatePath("/services");
    return getResult(true, 200, id);
  } catch {
    return getResult(false, 500, null);
  }
}
