"use client";
import { Label } from "@/app/_shadcn/components/ui/label";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { Button } from "@/app/_shadcn/components/ui/button";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import {
  DEFAULT_LANGUAGE,
  languages,
  toastHelper
} from "@/app/_lib/constants/general";
import { UpdateUserModel } from "@/app/_lib/types/user";
import { updateUserAction } from "@/app/_lib/serverActions/user";
import DropdownInput from "../input/DropdownInput";
import { Language, User } from "@/app/_prisma/browser";

interface ComponentProps {
  user: User;
}

export default function LanguageSettingsForm({ user }: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const { isLoading, setIsLoading } = useFormState();

  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);

  async function updateRecord(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const model: UpdateUserModel = {
      name: user.name,
      surname: user.surname,
      email: user.email,
      language
    };

    setIsLoading(true);
    const res = await updateUserAction(user.id, model);
    setIsLoading(false);

    if (res.ok) toastHelper.success(dict);
    else toastHelper.error(dict);
  }

  useEffect(() => {
    setLanguage(user.language);
  }, [user]);

  return (
    <form>
      <div className="p-8 bg-secondary rounded-3xl">
        <div className="text-xl font-semibold text-foreground">
          {dict.labels.languageSettings}
        </div>
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div>
            <Label htmlFor="language">{dict.labels.language}</Label>
            <DropdownInput
              className="mt-2 w-full"
              selected={language}
              options={languages}
              renderOption={(option) => dict.language[option]}
              onChange={(option) => option && setLanguage(option)}
            />
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
