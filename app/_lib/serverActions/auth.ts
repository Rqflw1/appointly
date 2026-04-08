"use server";

import { auth, signIn, signOut } from "../functions/auth";
import { SignInSchema, SignUpSchema } from "../validation/auth";
import { getResult } from "../functions/general";
import { verifyCsrfToken } from "../serverFunctions/csrf";
import { prisma } from "@/app/_lib/constants/prisma";
import { logAudit } from "../serverFunctions/audit";
import bcrypt from "bcrypt";
import { UserRole } from "@/app/_prisma/enums";

export async function signInAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const model = {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || "")
    };
    const zRes = SignInSchema.safeParse(model);
    if (!zRes.success) return getResult(false, 400, null);

    const res = await signIn("credentials", {
      email: zRes.data.email,
      password: zRes.data.password,
      redirect: false
    });

    if (res?.error) return getResult(false, 401, null);

    const user = await prisma.user.findFirst({
      where: { email: zRes.data.email },
      select: { id: true }
    });
    if (user) {
      await logAudit({
        userId: user.id,
        action: "sign_in",
        entityType: "user",
        entityId: user.id,
        description: "User signed in"
      });
    }

    return getResult(true, 200, null);
  } catch (error) {
    const message = String((error as any)?.message || "");
    if (message.includes("does not exist") || message.includes("P2021")) {
      return getResult(false, 500, "db_not_ready");
    }
    return getResult(false, 500, "server_error");
  }
}

export async function signOutAction(formData?: FormData) {
  if (formData) await verifyCsrfToken(formData);
  const session = await auth();
  if (session?.user?.id) {
    await logAudit({
      userId: session.user.id,
      action: "sign_out",
      entityType: "user",
      entityId: session.user.id,
      description: "User signed out"
    });
  }
  await signOut({ redirect: false });
  return getResult(true, 200, null);
}

export async function signUpAction(formData: FormData) {
  try {
    await verifyCsrfToken(formData);
    const model = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      confirmPassword: String(formData.get("confirmPassword") || "")
    };
    const zRes = SignUpSchema.safeParse(model);
    if (!zRes.success) return getResult(false, 400, "validation");

    const existingCount = await prisma.user.count();
    if (existingCount > 0) return getResult(false, 403, "disabled");

    const hash = await bcrypt.hash(zRes.data.password, 10);
    const created = await prisma.user.create({
      data: {
        name: zRes.data.name,
        email: zRes.data.email,
        password: hash,
        role: UserRole.ADMIN
      }
    });

    await logAudit({
      userId: created.id,
      action: "sign_up",
      entityType: "user",
      entityId: created.id,
      description: `User signed up ${created.email}`
    });

    await signIn("credentials", {
      email: zRes.data.email,
      password: zRes.data.password,
      redirect: false
    });

    return getResult(true, 200, null);
  } catch (error) {
    const message = String((error as any)?.message || "");
    if (message.includes("does not exist") || message.includes("P2021")) {
      return getResult(false, 500, "db_not_ready");
    }
    return getResult(false, 500, "server_error");
  }
}
