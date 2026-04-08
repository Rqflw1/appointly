"use client";

import { MouseEvent, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LocaleContext } from "../context/LocaleProvider";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import { Button } from "@/app/_shadcn/components/ui/button";
import { Input } from "@/app/_shadcn/components/ui/input";
import { Label } from "@/app/_shadcn/components/ui/label";
import FormError from "../general/FormError";
import {
  CodeSchema,
  EmailSchema,
  PasswordSchema
} from "@/app/_lib/validation/general";
import {
  createCodeAction,
  validateCodeAction
} from "@/app/_lib/serverActions/code";
import { recoverPasswordAction } from "@/app/_lib/serverActions/user";
import { CreateCodeModel, ValidateCodeModel } from "@/app/_lib/types/code";
import { RecoverPasswordModel } from "@/app/_lib/types/user";
import PasswordInput from "../input/PasswordInput";

export default function PasswordRecoveryForm() {
  const { dict } = useContext(LocaleContext);
  const router = useRouter();

  const { isLoading, setIsLoading, error, setError } = useFormState();
  const [success, setSuccess] = useState("");
  const [codeSent, setCodeSent] = useState(0);
  const [step, setStep] = useState(0);

  const [email, setEmail, emailError, setEmailError] = useInputValue("");
  const [code, setCode, codeError, setCodeError] = useInputValue("");
  const [password, setPassword, passwordError, setPasswordError] =
    useInputValue("");
  const [
    confirmPassword,
    setConfirmPassword,
    confirmPasswordError,
    setConfirmPasswordError
  ] = useInputValue("");

  useEffect(() => setError(""), [email, code, password, confirmPassword]);

  async function createCode(
    e: MouseEvent<HTMLButtonElement>,
    isResend = false
  ) {
    e.preventDefault();

    const zResEmail = EmailSchema.safeParse(email);

    if (!zResEmail.success) setEmailError(dict.errors.invalidEmail);

    if (!zResEmail.success) return;

    const model: CreateCodeModel = { email: zResEmail.data };
    setIsLoading(true);
    const res = await createCodeAction(model);
    setIsLoading(false);

    if (res.ok) {
      setStep(1);
      setError("");
      setCodeSent((prev) => prev + 1);
    } else if (isResend) {
      setError(dict.errors.unexpectedError);
    } else {
      if (res.code === 1) setEmailError(dict.errors.invalidEmail);
      if (res.code === 2) setEmailError(dict.errors.userDoesNotExist);
      if (res.code === 3) setError(dict.errors.unexpectedError);
      if (res.code === 4) setError(dict.errors.unexpectedError);
      if (res.code === 500) setError(dict.errors.unexpectedError);
    }
  }

  async function validateCode(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const zResEmail = EmailSchema.safeParse(email);
    const zResCode = CodeSchema.safeParse(code);

    if (!zResEmail.success) setError(dict.errors.unexpectedError);
    if (!zResCode.success) setCodeError(dict.errors.invalidCode);

    if (!zResEmail.success) return;
    if (!zResCode.success) return;

    const model: ValidateCodeModel = {
      email: zResEmail.data,
      code: zResCode.data
    };
    setIsLoading(true);
    const res = await validateCodeAction(model);
    setIsLoading(false);

    if (res.ok) {
      setStep(2);
      setError("");
    } else {
      if (res.code === 1) setError(dict.errors.unexpectedError);
      if (res.code === 2) setCodeError(dict.errors.invalidCode);
      if (res.code === 3) setError(dict.errors.userDoesNotExist);
      if (res.code === 4) setCodeError(dict.errors.invalidCode);
      if (res.code === 500) setError(dict.errors.unexpectedError);
    }
  }

  async function recoverPassword(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const zResEmail = EmailSchema.safeParse(email);
    const zResCode = CodeSchema.safeParse(code);
    const zResPassword = PasswordSchema.safeParse(password);

    if (!zResEmail.success) setError(dict.errors.unexpectedError);
    if (!zResCode.success) setError(dict.errors.unexpectedError);
    if (!zResPassword.success)
      setPasswordError(dict.errors.passwordMustContain);
    if (password !== confirmPassword)
      setConfirmPasswordError(dict.errors.passwordsDontMatch);

    if (!zResEmail.success) return;
    if (!zResCode.success) return;
    if (!zResPassword.success) return;
    if (password !== confirmPassword) return;

    const model: RecoverPasswordModel = {
      email: zResEmail.data,
      code: zResCode.data,
      password: zResPassword.data
    };
    setIsLoading(true);
    const res = await recoverPasswordAction(model);
    setIsLoading(false);

    if (res.ok) {
      setError("");
      setSuccess(dict.labels.success);
      setTimeout(() => {
        router.push("/sign-in");
        router.refresh();
      }, 500);
    } else {
      if (res.code === 1) setError(dict.errors.unexpectedError);
      if (res.code === 2) setError(dict.errors.unexpectedError);
      if (res.code === 3) setPasswordError(dict.errors.passwordMustContain);
      if (res.code === 4) setError(dict.errors.userDoesNotExist);
      if (res.code === 5) setCodeError(dict.errors.invalidCode);
      if (res.code === 500) setError(dict.errors.unexpectedError);
    }
  }

  return (
    <>
      {step === 0 && (
        <div>
          <div className="mt-2 text-center text-sm text-muted-foreground">
            {dict.labels.enterEmail}
          </div>
          <form>
            <FormError error={error} className="text-center mt-4" />
            <div className={error ? "mt-4" : "mt-6"}>
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
            <Button
              disabled={isLoading}
              isLoading={isLoading}
              type="submit"
              className="mt-6 w-full"
              onClick={(e) => createCode(e)}
            >
              {dict.labels.sendCode}
            </Button>
          </form>
        </div>
      )}
      {step === 1 && (
        <div>
          <div className="mt-2 text-center text-sm text-muted-foreground">
            {dict.labels.enterCode} <span className="font-medium">{email}</span>
          </div>
          <form>
            <FormError error={error} className="text-center mt-4" />
            <div className={error ? "mt-4" : "mt-6"}>
              <Label htmlFor="code">{dict.labels.code}</Label>
              <Input
                id="code"
                type="text"
                className="mt-2"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))
                }
                aria-invalid={!!codeError}
              />
              <FormError error={codeError} className="mt-1" />
            </div>
            <Button
              disabled={isLoading}
              isLoading={isLoading}
              type="submit"
              className="mt-6 w-full"
              onClick={(e) => validateCode(e)}
            >
              {dict.labels.submit}
            </Button>
          </form>
          {codeSent < 2 && (
            <button
              type="button"
              className="mt-4 block mx-auto text-sm text-primary underline-offset-2 hover:underline"
              onClick={(e) => createCode(e, true)}
            >
              {dict.labels.resendCode}
            </button>
          )}
          {codeSent >= 2 && (
            <div className="mt-4 text-center text-xs text-muted-foreground">
              {dict.labels.codeSent}
            </div>
          )}
        </div>
      )}
      {step === 2 && (
        <div>
          <div className="mt-2 text-center text-sm text-muted-foreground">
            {dict.labels.createNewPassword}
          </div>
          <form>
            {success && (
              <div className="mt-4 text-sm font-semibold text-center text-green-600">
                {success}
              </div>
            )}
            <FormError error={error} className="text-center mt-4" />
            <div className={error || success ? "mt-4" : "mt-6"}>
              <Label htmlFor="newPassword">{dict.labels.newPassword}</Label>
              <PasswordInput
                id="newPassword"
                className="mt-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!passwordError}
              />
              <FormError error={passwordError} className="mt-1" />
            </div>
            <div className="mt-4">
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
            <Button
              disabled={isLoading}
              isLoading={isLoading}
              type="submit"
              className="mt-6 w-full"
              onClick={(e) => recoverPassword(e)}
            >
              {dict.labels.save}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
