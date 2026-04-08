"use client";

import { MouseEvent, useContext, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import FormError from "../general/FormError";
import { Label } from "@/app/_shadcn/components/ui/label";
import { Input } from "@/app/_shadcn/components/ui/input";
import { Button } from "@/app/_shadcn/components/ui/button";
import { LocaleContext } from "../context/LocaleProvider";
import { EmailSchema } from "@/app/_lib/validation/general";
import { SignInModel } from "@/app/_lib/types/auth";
import { signInAction } from "@/app/_lib/serverActions/auth";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import PasswordInput from "../input/PasswordInput";

export default function SignInForm() {
  const { dict } = useContext(LocaleContext);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { isLoading, setIsLoading, error, setError } = useFormState();

  const [email, setEmail, emailError, setEmailError] = useInputValue("");
  const [password, setPassword] = useState("");

  useEffect(() => setError(""), [email, password]);

  async function signIn(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const zResEmail = EmailSchema.safeParse(email);

    if (!zResEmail.success) setEmailError(dict.errors.invalidEmail);

    if (!zResEmail.success) return;

    const model: SignInModel = { email: zResEmail.data, password };
    setIsLoading(true);
    const res = await signInAction(model);
    setIsLoading(false);

    if (res.ok) {
      const returnUrl = searchParams.get("returnUrl") || "";
      router.push(returnUrl || "/documents");
      // TODO: check if router.refresh() and refresh() from next/cache clears input fields on error
      router.refresh();
    } else setError(dict.errors.invalidEmailOrPassword);
  }

  return (
    <form>
      <FormError error={error} className="text-center mb-2" />
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
      <div className="mt-6">
        <div className="flex items-center">
          <Label htmlFor="password">{dict.labels.password}</Label>
          <Link
            href="/password-recovrey"
            className="ml-auto text-sm underline-offset-2 hover:underline"
          >
            {dict.labels.forgotYourPassword}
          </Link>
        </div>
        <PasswordInput
          id="password"
          className="mt-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button
        disabled={isLoading}
        isLoading={isLoading}
        type="submit"
        className="mt-6 w-full"
        onClick={signIn}
      >
        {dict.labels.signIn}
      </Button>
      <div className="mt-4 text-center text-sm">
        <span>{dict.labels.dontHaveAnAccount}</span>
        <Link
          href={`/sign-up?${searchParams.toString()}`}
          className="ml-2 underline-offset-2 underline"
        >
          {dict.labels.signUp}
        </Link>
      </div>
    </form>
  );
}
