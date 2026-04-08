"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { Plus } from "lucide-react";
import { UserAccessLevel } from "@/app/_prisma/enums";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import { roles, toastHelper } from "@/app/_lib/constants/general";
import { Label } from "@/app/_shadcn/components/ui/label";
import { Input } from "@/app/_shadcn/components/ui/input";
import FormError from "../general/FormError";
import DropdownInput from "../input/DropdownInput";
import { createAndSendInvitationAction } from "@/app/_lib/serverActions/invitation";
import { CreateInvitationModel } from "@/app/_lib/types/invitation";
import { EmailSchema } from "@/app/_lib/validation/general";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";

export default function NewInvitationDialog() {
  const { dict } = useContext(LocaleContext);

  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, setIsLoading } = useFormState();

  const [email, setEmail, emailError, setEmailError] = useInputValue("");
  const [role, setRole] = useInputValue<UserAccessLevel>(
    UserAccessLevel.VIEWER
  );

  async function createInvitation(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const zResEmail = EmailSchema.safeParse(email);

    if (!zResEmail.success) setEmailError(dict.errors.invalidEmail);

    if (!zResEmail.success) return;

    const model: CreateInvitationModel = { email: zResEmail.data, role };

    setIsLoading(true);
    const res = await createAndSendInvitationAction(model);
    setIsLoading(false);

    if (res.ok) {
      toastHelper.success(dict);
      setIsOpen(false);
    } else toastHelper.error(dict);
  }

  useEffect(() => {
    setEmail("");
    setRole(UserAccessLevel.VIEWER);
  }, [isOpen]);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        <Plus />
        <span>{dict.labels.inviteUser}</span>
      </Button>
      <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dict.labels.inviteUser}</DialogTitle>
          </DialogHeader>
          <form className="p-6 flex flex-col gap-6 bg-secondary rounded-3xl">
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
            <div>
              <Label htmlFor="type">{dict.labels.role}</Label>
              <DropdownInput
                className="mt-2 w-full"
                selected={role}
                options={roles}
                renderOption={(option) => dict.userAccessLevel[option]}
                onChange={(option) => option && setRole(option)}
              />
            </div>
          </form>
          <DialogFooter>
            <Button
              disabled={isLoading}
              isLoading={isLoading}
              type="submit"
              className="w-36"
              onClick={createInvitation}
            >
              {dict.labels.send}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
