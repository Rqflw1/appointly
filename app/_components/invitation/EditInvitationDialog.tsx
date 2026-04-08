"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import { MouseEvent, useContext, useEffect } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import {
  NEXT_PUBLIC_BASE_URL,
  toastHelper
} from "@/app/_lib/constants/general";
import { SetState } from "@/app/_lib/types/general";
import { Label } from "@/app/_shadcn/components/ui/label";
import { Input } from "@/app/_shadcn/components/ui/input";
import FormError from "../general/FormError";
import { updateAndSendInvitationAction } from "@/app/_lib/serverActions/invitation";
import { EmailSchema } from "@/app/_lib/validation/general";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";
import { Invitation } from "@/app/_prisma/browser";

interface ComponentProps {
  isOpen: boolean;
  setIsOpen: SetState<boolean>;
  invitation: Invitation;
}

export default function EditInvitationDialog({
  isOpen,
  setIsOpen,
  invitation
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const { isLoading, setIsLoading } = useFormState();

  const [email, setEmail, emailError, setEmailError] = useInputValue("");

  async function updateAndSendInvitation(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const zResEmail = EmailSchema.safeParse(email);

    if (!zResEmail.success) setEmailError(dict.errors.invalidEmail);

    if (!zResEmail.success) return;

    setIsLoading(true);
    const res = await updateAndSendInvitationAction(
      invitation.id,
      zResEmail.data
    );
    setIsLoading(false);

    if (res.ok) {
      toastHelper.success(dict);
      setIsOpen(false);
    } else toastHelper.error(dict);
  }

  useEffect(() => {
    setEmail(invitation.email);
  }, [isOpen, invitation]);

  return (
    <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.labels.editInvitation}</DialogTitle>
        </DialogHeader>
        <form className="p-6 flex flex-col gap-6 bg-secondary rounded-3xl">
          <div>
            <Label htmlFor="link">{dict.labels.invitationLink}</Label>
            <Input
              id="link"
              type="text"
              className="mt-2"
              value={`${NEXT_PUBLIC_BASE_URL}/invitations/${invitation.id}`}
            />
          </div>
          <div>
            <Label htmlFor="email">{dict.labels.email}</Label>
            <Input
              id="email"
              type="text"
              className="mt-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!emailError}
            />
            <FormError error={emailError} className="mt-1" />
          </div>
        </form>
        <DialogFooter>
          <Button
            disabled={isLoading}
            isLoading={isLoading}
            type="submit"
            className="w-36"
            onClick={updateAndSendInvitation}
          >
            {dict.labels.send}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
