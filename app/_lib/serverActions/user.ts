"use server";

import bcrypt from "bcrypt";
import { prisma } from "@/app/_lib/constants/prisma";
import { getResult } from "@/app/_lib/functions/general";
import {
  ChangePasswordSchema,
  CreateUserSchema,
  UpdateLanguageSchema,
  UpdateUserSchema
} from "@/app/_lib/validation/auth";
import { getSessionAndUser } from "../serverFunctions/auth";
import { logAudit } from "../serverFunctions/audit";
import { verifyCsrfToken } from "../serverFunctions/csrf";
import { Language, UserRole } from "@/app/_prisma/enums";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

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
      role: formData.get("role") || UserRole.MANAGER,
      language: formData.get("language") || undefined
    };
    const zRes = UpdateUserSchema.safeParse(data);
    if (!zRes.success) return getResult(false, 400, null);

    await prisma.user.update({
      where: { id },
      data: {
        name: zRes.data.name,
        email: zRes.data.email,
        role: zRes.data.role,
        language: (zRes.data.language as Language | undefined) ?? undefined
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
      role: user.role,
      language: formData.get("language") || undefined,
      workdayStart: String(formData.get("workdayStart") || ""),
      workdayEnd: String(formData.get("workdayEnd") || "")
    };
    const zRes = UpdateUserSchema.safeParse(data);
    if (!zRes.success) return getResult(false, 400, null);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: zRes.data.name,
        email: zRes.data.email,
        language: (zRes.data.language as Language | undefined) ?? user.language,
        workdayStart: zRes.data.workdayStart || user.workdayStart,
        workdayEnd: zRes.data.workdayEnd || user.workdayEnd
      }
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

export async function updateLanguageAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401, null);

    const data = {
      language: formData.get("language")
    };
    const zRes = UpdateLanguageSchema.safeParse(data);
    if (!zRes.success) return getResult(false, 400, null);

    const store = await cookies();
    store.set("language", zRes.data.language, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    });

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { language: zRes.data.language }
      });
    } catch {
      // If DB enum is not migrated yet, keep cookie-based locale anyway.
    }

    await logAudit({
      userId: user.id,
      action: "update_language",
      entityType: "user",
      entityId: user.id,
      description: `Updated language to ${zRes.data.language}`
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    return getResult(true, 200, user.id);
  } catch {
    return getResult(false, 500, null);
  }
}
