"use server";

import bcrypt from "bcrypt";
import { prisma } from "@/app/_lib/constants/prisma";
import { getResult } from "@/app/_lib/functions/general";
import {
  ChangePasswordSchema,
  CreateUserSchema,
  UpdateUserSchema
} from "@/app/_lib/validation/auth";
import { getSessionAndUser } from "../serverFunctions/auth";
import { logAudit } from "../serverFunctions/audit";
import { verifyCsrfToken } from "../serverFunctions/csrf";
import { UserRole } from "@/app/_prisma/enums";
import { revalidatePath } from "next/cache";

export async function createUserAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user || user.role !== UserRole.ADMIN) return getResult(false, 403, null);

    const data = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      role: formData.get("role") || UserRole.MANAGER
    };
    const zRes = CreateUserSchema.safeParse(data);
    if (!zRes.success) return getResult(false, 400, null);

    const hash = await bcrypt.hash(zRes.data.password, 10);
    const created = await prisma.user.create({
      data: {
        name: zRes.data.name,
        email: zRes.data.email,
        password: hash,
        role: zRes.data.role
      }
    });

    await logAudit({
      userId: user.id,
      action: "create_user",
      entityType: "user",
      entityId: created.id,
      description: `Created user ${created.email}`
    });

    revalidatePath("/users");
    return getResult(true, 200, created.id);
  } catch {
    return getResult(false, 500, null);
  }
}

export async function updateUserAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user || user.role !== UserRole.ADMIN) return getResult(false, 403, null);

    const id = String(formData.get("id") || "");
    const data = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      role: formData.get("role") || UserRole.MANAGER
    };
    const zRes = UpdateUserSchema.safeParse(data);
    if (!zRes.success) return getResult(false, 400, null);

    await prisma.user.update({
      where: { id },
      data: {
        name: zRes.data.name,
        email: zRes.data.email,
        role: zRes.data.role
      }
    });

    await logAudit({
      userId: user.id,
      action: "update_user",
      entityType: "user",
      entityId: id,
      description: `Updated user ${id}`
    });

    revalidatePath("/users");
    return getResult(true, 200, id);
  } catch {
    return getResult(false, 500, null);
  }
}

export async function deleteUserAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user || user.role !== UserRole.ADMIN) return getResult(false, 403, null);

    const id = String(formData.get("id") || "");
    if (id === user.id) return getResult(false, 400, null);

    await prisma.user.delete({ where: { id } });

    await logAudit({
      userId: user.id,
      action: "delete_user",
      entityType: "user",
      entityId: id,
      description: `Deleted user ${id}`
    });

    revalidatePath("/users");
    return getResult(true, 200, id);
  } catch {
    return getResult(false, 500, null);
  }
}

export async function updateProfileAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401, null);

    const data = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      role: user.role
    };
    const zRes = UpdateUserSchema.safeParse(data);
    if (!zRes.success) return getResult(false, 400, null);

    await prisma.user.update({
      where: { id: user.id },
      data: { name: zRes.data.name, email: zRes.data.email }
    });

    await logAudit({
      userId: user.id,
      action: "update_profile",
      entityType: "user",
      entityId: user.id,
      description: "Updated profile"
    });

    revalidatePath("/profile");
    return getResult(true, 200, user.id);
  } catch {
    return getResult(false, 500, null);
  }
}

export async function changePasswordAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401, null);

    const data = {
      currentPassword: String(formData.get("currentPassword") || ""),
      newPassword: String(formData.get("newPassword") || ""),
      confirmPassword: String(formData.get("confirmPassword") || "")
    };
    const zRes = ChangePasswordSchema.safeParse(data);
    if (!zRes.success) return getResult(false, 400, null);
    if (zRes.data.newPassword !== zRes.data.confirmPassword)
      return getResult(false, 400, null);

    const dbUser = await prisma.user.findFirst({ where: { id: user.id } });
    if (!dbUser) return getResult(false, 404, null);

    const isMatch = await bcrypt.compare(
      zRes.data.currentPassword,
      dbUser.password
    );
    if (!isMatch) return getResult(false, 400, null);

    const hash = await bcrypt.hash(zRes.data.newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hash } });

    await logAudit({
      userId: user.id,
      action: "change_password",
      entityType: "user",
      entityId: user.id,
      description: "Changed password"
    });

    revalidatePath("/profile");
    return getResult(true, 200, user.id);
  } catch {
    return getResult(false, 500, null);
  }
}
