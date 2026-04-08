"use client";

import { useFormState } from "@/app/_lib/hooks/useFormState";
import { Button } from "@/app/_shadcn/components/ui/button";
import { MouseEvent, useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import {
  acceptInvitationAction,
  deleteInvitationAction
} from "@/app/_lib/serverActions/invitation";
import { toastHelper } from "@/app/_lib/constants/general";
import { useRouter } from "next/navigation";
import { Invitation } from "@/app/_prisma/browser";
import { selectComapnyAction } from "@/app/_lib/serverActions/company";

interface ComponentProps {
  invitation: Invitation;
}

// TODO split loading

export default function InvitationButtons({ invitation }: ComponentProps) {
  const { dict } = useContext(LocaleContext);
  const router = useRouter();

  const { isLoading, setIsLoading } = useFormState();

  async function acceptInvitation(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    setIsLoading(true);
    const res = await acceptInvitationAction(invitation.id);
    setIsLoading(false);

    if (res.ok) {
      toastHelper.success(dict);
      await selectComapnyAction(invitation.companyId);
      setTimeout(() => router.push("/documents"), 500);
    } else toastHelper.error(dict);
  }

  async function rejectInvitation(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    setIsLoading(true);
    await deleteInvitationAction(invitation.id);
    router.push("/companies");
  }

  return (
    <form>
      <div className="flex justify-center">
        <Button
          disabled={isLoading}
          isLoading={isLoading}
          type="submit"
          onClick={acceptInvitation}
        >
          {dict.labels.accept}
        </Button>
      </div>
      <div className="mt-2 flex justify-center">
        <Button
          disabled={isLoading}
          isLoading={isLoading}
          variant="destructive"
          type="submit"
          onClick={rejectInvitation}
        >
          {dict.labels.reject}
        </Button>
      </div>
    </form>
  );
}
