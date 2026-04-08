"use client";

import FormError from "../general/FormError";
import { Label } from "@/app/_shadcn/components/ui/label";
import { MouseEvent, useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { Button } from "@/app/_shadcn/components/ui/button";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import { toastHelper } from "@/app/_lib/constants/general";
import { ChangePasswordModel } from "@/app/_lib/types/user";
import { changePasswordAction } from "@/app/_lib/serverActions/user";
import { PasswordSchema } from "@/app/_lib/validation/general";
import PasswordInput from "../input/PasswordInput";

export default function ChangePasswordForm() {
  const { dict } = useContext(LocaleContext);

  const { isLoading, setIsLoading } = useFormState();

  const [
    currentPassword,
    setCurrentPassword,
    currentPasswordError,
    setCurrentPasswordError
  ] = useInputValue("");
  const [newPassword, setNewPassword, newPasswordError, setNewPasswordError] =
    useInputValue("");
  const [
    confirmPassword,
    setConfirmPassword,
    confirmPasswordError,
    setConfirmPasswordError
  ] = useInputValue("");

  async function changePassword(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const zResPassword = PasswordSchema.safeParse(newPassword);

    if (!zResPassword.success)
      setNewPasswordError(dict.errors.passwordMustContain);
    if (newPassword !== confirmPassword)
      setConfirmPasswordError(dict.errors.passwordsDontMatch);

    if (!zResPassword.success) return;
    if (newPassword !== confirmPassword) return;

    const model: ChangePasswordModel = { currentPassword, newPassword };

    setIsLoading(true);
    const res = await changePasswordAction(model);
    setIsLoading(false);

    if (res.ok) {
      toastHelper.success(dict);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      if (res.code === 1) setCurrentPasswordError(dict.errors.invalidPassword);
      if (res.code === 500) toastHelper.error(dict);
    }
  }

  return (
    <form>
      <div className="p-8 bg-secondary rounded-3xl">
        <div className="text-xl font-semibold text-foreground">
          {dict.labels.changePassword}
        </div>
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div>
            <Label htmlFor="currentPassword">
              {dict.labels.currentPassword}
            </Label>
            <PasswordInput
              id="currentPassword"
              className="mt-2"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              aria-invalid={!!currentPasswordError}
            />
            <FormError error={currentPasswordError} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="newPassword">{dict.labels.newPassword}</Label>
            <PasswordInput
              id="newPassword"
              className="mt-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              aria-invalid={!!newPasswordError}
            />
            <FormError error={newPasswordError} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="confirmPassword">
              {dict.labels.confirmPassword}
            </Label>
            <PasswordInput
              id="confirmPassword"
              className="mt-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={!!confirmPasswordError}
            />
            <FormError error={confirmPasswordError} className="mt-1" />
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button
          disabled={isLoading}
          isLoading={isLoading}
          type="submit"
          className="w-48"
          onClick={changePassword}
        >
          {dict.labels.save}
        </Button>
      </div>
    </form>
  );
}
