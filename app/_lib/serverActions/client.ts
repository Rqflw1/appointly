"use server";

import { prisma } from "@/app/_lib/constants/prisma";
import { getResult } from "@/app/_lib/functions/general";
import { ClientSchema } from "@/app/_lib/validation/client";
import { getSessionAndUser } from "../serverFunctions/auth";
import { scopeId } from "../serverFunctions/rbac";
import { logAudit } from "../serverFunctions/audit";
import { verifyCsrfToken } from "../serverFunctions/csrf";
import { revalidatePath } from "next/cache";

export async function createClientAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401, null);

    const data = {
      firstName: String(formData.get("firstName") || ""),
      lastName: formData.get("lastName")?.toString() ?? "",
      phone: formData.get("phone")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      notes: String(formData.get("notes") || "")
    };
    const zRes = ClientSchema.safeParse(data);
    if (!zRes.success) return getResult(false, 400, null);

    const client = await prisma.client.create({
      data: {
        ...zRes.data,
        phone: zRes.data.phone ?? null,
        email: zRes.data.email ?? null,
        managerId: user.id
      }
    });

    await logAudit({
      userId: user.id,
      action: "create_client",
      entityType: "client",
      entityId: client.id,
      description: `Created client ${client.firstName} ${client.lastName}`
    });

    revalidatePath("/clients");
    return getResult(true, 200, client.id);
  } catch {
    return getResult(false, 500, null);
  }
}

export async function updateClientAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401, null);

    const id = String(formData.get("id") || "");
    const data = {
      firstName: String(formData.get("firstName") || ""),
      lastName: formData.get("lastName")?.toString() ?? "",
      phone: formData.get("phone")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      notes: String(formData.get("notes") || "")
    };
    const zRes = ClientSchema.safeParse(data);
    if (!zRes.success) return getResult(false, 400, null);

    const existing = await prisma.client.findFirst({ where: { id } });
    if (!existing) return getResult(false, 404, null);
    if (!scopeId(user, existing.managerId)) return getResult(false, 403, null);

    await prisma.client.update({
      where: { id },
      data: {
        ...zRes.data,
        phone: zRes.data.phone ?? null,
        email: zRes.data.email ?? null
      }
    });

    await logAudit({
      userId: user.id,
      action: "update_client",
      entityType: "client",
      entityId: id,
      description: `Updated client ${zRes.data.firstName} ${zRes.data.lastName}`
    });

    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    return getResult(true, 200, id);
  } catch {
    return getResult(false, 500, null);
  }
}

export async function deleteClientAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401, null);

    const id = String(formData.get("id") || "");
    const existing = await prisma.client.findFirst({ where: { id } });
    if (!existing) return getResult(false, 404, null);
    if (!scopeId(user, existing.managerId)) return getResult(false, 403, null);

    await prisma.client.delete({ where: { id } });

    await logAudit({
      userId: user.id,
      action: "delete_client",
      entityType: "client",
      entityId: id,
      description: `Deleted client ${existing.firstName} ${existing.lastName}`
    });

    revalidatePath("/clients");
    return getResult(true, 200, id);
  } catch {
    return getResult(false, 500, null);
  }
}
