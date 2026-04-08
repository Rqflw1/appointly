"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/app/_lib/serverActions/auth";

export default function SignOutHelper() {
  const router = useRouter();

  useEffect(() => {
    signOutAction();
    router.push("/sign-in");
  }, []);

  return null;
}
