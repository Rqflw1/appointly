"use client";

import { Label } from "@/app/_shadcn/components/ui/label";
import { MouseEvent, useContext, useEffect } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { toastHelper } from "@/app/_lib/constants/general";
import { Button } from "@/app/_shadcn/components/ui/button";
import { Input } from "@/app/_shadcn/components/ui/input";
import { Textarea } from "@/app/_shadcn/components/ui/textarea";
import FormError from "../general/FormError";
import { Badge } from "@/app/_shadcn/components/ui/badge";
import { X } from "lucide-react";
import { CreateEmailSettingsModel } from "@/app/_lib/types/emailSettings";
import { upsertEmailSettingsAction } from "@/app/_lib/serverActions/emailSettings";
import { EmailSchema } from "@/app/_lib/validation/general";
import { DocumentType, EmailSettings } from "@/app/_prisma/browser";

interface ComponentProps {
  type: DocumentType;
  settings: EmailSettings | null;
}

export default function EmailSettingsByTypeTab({
  type,
  settings
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const { isLoading, setIsLoading } = useFormState();

  const [ccInput, setCcInput, ccInputError, setCcInputError] =
    useInputValue("");
  const [cc, setCc] = useInputValue<string[]>([]);
  const [subject, setSubject] = useInputValue("");
  const [message, setMessage] = useInputValue("");

  function addCc() {
    const zResEmail = EmailSchema.safeParse(ccInput);

    if (!zResEmail.success) setCcInputError(dict.errors.invalidEmail);

    if (!zResEmail.success) return;

    setCc((old) => [...old, zResEmail.data]);
    setCcInput("");
  }

  async function upsertRecord(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const model: CreateEmailSettingsModel = {
      type,
      cc,
      subject,
      message
    };

    setIsLoading(true);
    const res = await upsertEmailSettingsAction(model);
    setIsLoading(false);

    if (res.ok) toastHelper.success(dict);
    else toastHelper.error(dict);
  }

  useEffect(() => {
    setCcInput("");
    setCc(settings?.cc?.split(",")?.filter(Boolean) ?? []);
    setSubject(settings?.subject || "");
    setMessage(settings?.message || "");
  }, [settings]);

  return (
    <form>
      <div className="p-8 bg-secondary rounded-3xl">
        <div className="text-xl font-semibold text-foreground">
          {`${dict.documentType[type]} ${dict.labels.emailSettingsLowercase}`}
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6">
          <div>
            <Label htmlFor="ccInput">{dict.labels.cc}</Label>
            <div className="mt-2 flex gap-2 flex-wrap">
              {cc.map((email, key) => (
                <Badge key={key} variant="tertiary">
                  <div>{email}</div>
                  <X
                    className="!pointer-events-auto cursor-pointer hover:text-foreground"
                    onClick={() =>
                      setCc((old) => old.filter((_, i) => i !== key))
                    }
                  />
                </Badge>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                id="ccInput"
                type="text"
                value={ccInput}
                onChange={(e) => setCcInput(e.target.value)}
                aria-invalid={!!ccInputError}
              />
              <Button type="button" onClick={addCc}>
                {dict.labels.add}
              </Button>
            </div>
            <FormError error={ccInputError} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="subject">{dict.labels.subject}</Label>
            <Input
              id="subject"
              type="text"
              className="mt-2"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="message">{dict.labels.message}</Label>
            <Textarea
              id="message"
              className="mt-2 h-32"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
          onClick={upsertRecord}
        >
          {dict.labels.save}
        </Button>
      </div>
    </form>
  );
}
