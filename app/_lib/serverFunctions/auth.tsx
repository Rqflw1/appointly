import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../functions/auth";
import { prisma } from "@/app/_lib/constants/prisma";
import SignOutHelper from "@/app/_components/auth/SignOutHelper";
import React from "react";
import { UserRole } from "@/app/_prisma/enums";
import { User } from "@/app/_prisma/client";

export async function redirectWithReturnUrl(url: string) {
  const pathname = (await headers()).get("x-pathname");
  if (pathname) {
    const searchParams = new URLSearchParams();
    searchParams.set("returnUrl", pathname);
    url = `${url}?${searchParams.toString()}`;
  }
  return redirect(url);
}

export async function getSessionAndUser() {
  try {
    const session = await auth();
    if (session && session.user) {
      const user = await prisma.user.findFirst({
        where: { id: session.user.id ?? "" }
      });
      return { session, user };
    }
    return { session, user: null };
  } catch {
    return { session: null, user: null };
  }
}

export function publicRoute<P extends {}>(Page: React.FunctionComponent<P>) {
  return async function Wrapped(props: React.ComponentProps<typeof Page>) {
    const { session, user } = await getSessionAndUser();
    if (session && !user) return <SignOutHelper />;
    if (user) return redirect("/dashboard");

    return <Page {...props} />;
  };
}

export function protectedRoute<P extends { user: User }>(
  Page: React.FunctionComponent<P>
) {
  return async function Wrapped(props: Omit<P, "user">) {
    const { session, user } = await getSessionAndUser();
    if (session && !user) return <SignOutHelper />;
    if (!user) return await redirectWithReturnUrl("/sign-in");

    // @ts-ignore
    return <Page {...props} user={user} />;
  };
}

export function requireAdmin(user: User) {
  if (user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }
}
