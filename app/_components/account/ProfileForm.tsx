"use client";

import { Input } from "@/app/_shadcn/components/ui/input";
import FormError from "../general/FormError";
import { Label } from "@/app/_shadcn/components/ui/label";
import { MouseEvent, useContext, useEffect } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { Button } from "@/app/_shadcn/components/ui/button";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import { toastHelper } from "@/app/_lib/constants/general";
import { UpdateUserModel } from "@/app/_lib/types/user";
import { updateUserAction } from "@/app/_lib/serverActions/user";
import { EmailSchema } from "@/app/_lib/validation/general";
import { User } from "@/app/_prisma/browser";

interface ComponentProps {
  user: User;
}

export default function ProfileForm({ user }: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const { isLoading, setIsLoading } = useFormState();

  const [name, setName, nameError, setNameError] = useInputValue("");
  const [surname, setSurname, surnameError, setSurnameError] =
    useInputValue("");
  const [email, setEmail, emailError, setEmailError] = useInputValue("");

  async function updateRecord(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const zResEmail = EmailSchema.safeParse(email);

    if (!name) setNameError(dict.errors.nameIsRequired);
    if (!surname) setSurnameError(dict.errors.surnameIsRequired);
    if (!zResEmail.success) setEmailError(dict.errors.invalidEmail);

    if (!name) return;
    if (!surname) return;
    if (!zResEmail.success) return;

    const model: UpdateUserModel = {
      name,
      surname,
      email: zResEmail.data,
      language: user.language
    };

    setIsLoading(true);
    const res = await updateUserAction(user.id, model);
    setIsLoading(false);

    if (res.ok) toastHelper.success(dict);
    else toastHelper.error(dict);
  }

  useEffect(() => {
    setName(user.name);
    setSurname(user.surname);
    setEmail(user.email);
  }, [user]);

  return (
    <form>
      <div className="p-8 bg-secondary rounded-3xl">
        <div className="text-xl font-semibold text-foreground">
          {dict.labels.userInformation}
        </div>
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div>
            <Label htmlFor="name">{dict.labels.name}</Label>
            <Input
              id="name"
              type="text"
              className="mt-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!nameError}
            />
            <FormError error={nameError} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="surname">{dict.labels.surname}</Label>
            <Input
              id="surname"
              type="text"
              className="mt-2"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              aria-invalid={!!surnameError}
            />
            <FormError error={surnameError} className="mt-1" />
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
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button
          disabled={isLoading}
          isLoading={isLoading}
          type="submit"
          className="w-48"
          onClick={updateRecord}
        >
          {dict.labels.save}
        </Button>
      </div>
    </form>
  );
}
