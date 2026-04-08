"use client";

import { useRouter } from "next/navigation";
import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { signOutAction } from "@/app/_lib/serverActions/auth";
import {
  DropdownMenuItem,
  DropdownMenuShortcut
} from "@/app/_shadcn/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

export default function SignOutDropdownMenuItem() {
  const { dict } = useContext(LocaleContext);
  const router = useRouter();

  async function signOut() {
    await signOutAction();
    router.push("/sign-in");
  }

  return (
    <DropdownMenuItem onClick={signOut}>
      {dict.labels.signOut}
      <DropdownMenuShortcut>
        <LogOut />
      </DropdownMenuShortcut>
    </DropdownMenuItem>
  );
}
