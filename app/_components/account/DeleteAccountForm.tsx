"use client";

import FormError from "../general/FormError";
import { Label } from "@/app/_shadcn/components/ui/label";
import { MouseEvent, useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { Button } from "@/app/_shadcn/components/ui/button";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import { useRouter } from "next/navigation";
import { toastHelper } from "@/app/_lib/constants/general";
import { DeleteUserModel } from "@/app/_lib/types/user";
import { deleteUserAction } from "@/app/_lib/serverActions/user";
import { signOutAction } from "@/app/_lib/serverActions/auth";
import PasswordInput from "../input/PasswordInput";

export default function DeleteAccountForm() {
  const { dict } = useContext(LocaleContext);
  const router = useRouter();

  const { isLoading, setIsLoading } = useFormState();

  const [password, setPassword, passwordError, setPasswordError] =
    useInputValue("");

  async function deleteUser(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const model: DeleteUserModel = { password };

    setIsLoading(true);
    const res = await deleteUserAction(model);
    setIsLoading(false);

    if (res.ok) {
      toastHelper.success(dict);
      await signOutAction();
      router.push("/sign-in");
    } else {
      if (res.code === 1) setPasswordError(dict.errors.invalidPassword);
      if (res.code === 500) toastHelper.error(dict);
    }
  }

  return (
    <form>
      <div className="p-8 bg-secondary rounded-3xl">
        <div className="text-xl font-semibold text-foreground">
          {dict.labels.deleteAccount}
        </div>
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div>
            <Label htmlFor="password">{dict.labels.password}</Label>
            <PasswordInput
              id="password"
              className="mt-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!passwordError}
            />
            <FormError error={passwordError} className="mt-1" />
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button
          disabled={isLoading}
          isLoading={isLoading}
          variant="destructive"
          type="submit"
          className="w-48"
          onClick={deleteUser}
        >
          {dict.labels.delete}
        </Button>
      </div>
    </form>
  );
}
