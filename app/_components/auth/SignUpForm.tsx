"use client";

import { MouseEvent, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import FormError from "../general/FormError";
import { Label } from "@/app/_shadcn/components/ui/label";
import { Input } from "@/app/_shadcn/components/ui/input";
import { Button } from "@/app/_shadcn/components/ui/button";
import { LocaleContext } from "../context/LocaleProvider";
import { Checkbox } from "@/app/_shadcn/components/ui/checkbox";
import { EmailSchema, PasswordSchema } from "@/app/_lib/validation/general";
import { SignUpModel } from "@/app/_lib/types/auth";
import { signUpAction } from "@/app/_lib/serverActions/auth";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import { toastHelper } from "@/app/_lib/constants/general";
import PasswordInput from "../input/PasswordInput";

export default function SignUpForm() {
  const { dict } = useContext(LocaleContext);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { isLoading, setIsLoading } = useFormState();

  const [name, setName, nameError, setNameError] = useInputValue("");
  const [surname, setSurname, surnameError, setSurnameError] =
    useInputValue("");
  const [email, setEmail, emailError, setEmailError] = useInputValue("");
  const [password, setPassword, passwordError, setPasswordError] =
    useInputValue("");
  const [
    confirmPassword,
    setConfirmPassword,
    confirmPasswordError,
    setConfirmPasswordError
  ] = useInputValue("");
  const [agree, setAgree, agreeError, setAgreeError] = useInputValue(false);

  async function signUp(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const zResEmail = EmailSchema.safeParse(email);
    const zResPassword = PasswordSchema.safeParse(password);

    if (!name) setNameError(dict.errors.nameIsRequired);
    if (!surname) setSurnameError(dict.errors.surnameIsRequired);
    if (!zResEmail.success) setEmailError(dict.errors.invalidEmail);
    if (!zResPassword.success)
      setPasswordError(dict.errors.passwordMustContain);
    if (password !== confirmPassword)
      setConfirmPasswordError(dict.errors.passwordsDontMatch);
    if (!agree) setAgreeError(dict.errors.youMustAgree);

    if (!name) return;
    if (!surname) return;
    if (!zResEmail.success) return;
    if (!zResPassword.success) return;
    if (password !== confirmPassword) return;
    if (!agree) return;

    const model: SignUpModel = {
      name,
      surname,
      email: zResEmail.data,
      password: zResPassword.data
    };
    setIsLoading(true);
    const res = await signUpAction(model);
    setIsLoading(false);

    if (res.ok) {
      const returnUrl = searchParams.get("returnUrl") || "";
      router.push(returnUrl || "/documents");
      // TODO: check if router.refresh() and refresh() from next/cache clears input fields on error
      router.refresh();
    } else {
      if (res.code === 1) setEmailError(dict.errors.userAlreadyExists);
      if (res.code === 500) toastHelper.error(dict);
    }
  }

  return (
    <form>
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
      <div className="mt-6">
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
      <div className="mt-6">
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
      <div className="mt-6">
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
      <div className="mt-6">
        <Label htmlFor="confirmPassword">{dict.labels.confirmPassword}</Label>
        <PasswordInput
          id="confirmPassword"
          className="mt-2"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          aria-invalid={!!confirmPasswordError}
        />
        <FormError error={confirmPasswordError} className="mt-1" />
      </div>
      <div className="mt-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id="agree"
            checked={agree}
            onCheckedChange={(value) => setAgree(!!value)}
            aria-invalid={!!agreeError}
          />
          <Label htmlFor="agree" className="font-normal">
            <div>{dict.texts.agreeToTerms}</div>
          </Label>
        </div>
        <FormError error={agreeError} className="mt-2" />
      </div>
      <Button
        disabled={isLoading}
        isLoading={isLoading}
        type="submit"
        className="mt-6 w-full"
        onClick={signUp}
      >
        {dict.labels.signUp}
      </Button>
      <div className="mt-4 text-center text-sm">
        <span>{dict.labels.alreadyHaveAnAccount}</span>
        <Link
          href={`/sign-in?${searchParams.toString()}`}
          className="ml-2 underline-offset-2 underline"
        >
          {dict.labels.signIn}
        </Link>
      </div>
    </form>
  );
}
