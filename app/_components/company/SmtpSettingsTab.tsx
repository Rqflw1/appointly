"use client";

import { Label } from "@/app/_shadcn/components/ui/label";
import { MouseEvent, useContext, useEffect } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { toastHelper } from "@/app/_lib/constants/general";
import { UpdateCompanySmtpModel } from "@/app/_lib/types/company";
import { updateCompanySmtpAction } from "@/app/_lib/serverActions/company";
import { Button } from "@/app/_shadcn/components/ui/button";
import { Input } from "@/app/_shadcn/components/ui/input";
import { sendTestEmailAction } from "@/app/_lib/serverActions/emailSettings";
import { Company } from "@/app/_prisma/browser";
import PasswordInput from "../input/PasswordInput";

interface ComponentProps {
  company: Company;
  smtpPassword: string;
}

export default function SmtpSettingsTab({
  company,
  smtpPassword
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const { isLoading, setIsLoading } = useFormState();
  const { isLoading: isLoadingTest, setIsLoading: setIsLoadingTest } =
    useFormState();

  const [host, setHost] = useInputValue("");
  const [user, setUser] = useInputValue("");
  const [password, setPassword] = useInputValue("");

  async function sendTestEmail(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    setIsLoadingTest(true);
    const res = await sendTestEmailAction();
    setIsLoadingTest(false);

    if (res.ok) toastHelper.success(dict);
    else toastHelper.error(dict);
  }

  async function updateRecord(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const model: UpdateCompanySmtpModel = {
      smtpHost: host,
      smtpUser: user,
      smtpPassword: password
    };

    setIsLoading(true);
    const res = await updateCompanySmtpAction(model);
    setIsLoading(false);

    if (res.ok) toastHelper.success(dict);
    else toastHelper.error(dict);
  }

  useEffect(() => {
    setHost(company.smtpHost);
    setUser(company.smtpUser);
    setPassword(smtpPassword);
  }, [company, smtpPassword]);

  return (
    <form>
      <div className="p-8 bg-secondary rounded-3xl">
        <div className="text-xl font-semibold text-foreground">
          {dict.labels.smtpSettings}
        </div>
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div>
            <Label htmlFor="host">{dict.labels.host}</Label>
            <Input
              id="host"
              type="text"
              className="mt-2"
              value={host}
              onChange={(e) => setHost(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="user">{dict.labels.user}</Label>
            <Input
              id="user"
              type="text"
              className="mt-2"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">{dict.labels.password}</Label>
            <PasswordInput
              id="password"
              className="mt-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
      </div>
      {/* <div className="mt-6 flex">
        <Button
          disabled={isLoading}
          isLoading={isLoading}
          type="submit"
          className="ml-auto w-48"
          onClick={updateCompany}
        >
          {dict.labels.save}
        </Button>
      </div> */}

      <div className="mt-6 flex justify-end gap-2">
        <Button
          disabled={isLoadingTest}
          isLoading={isLoadingTest}
          variant="secondary"
          type="submit"
          className="w-36"
          onClick={sendTestEmail}
        >
          {dict.labels.sendTestEmail}
        </Button>
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
