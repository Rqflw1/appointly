"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useContext,
  useEffect
} from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import { toastHelper } from "@/app/_lib/constants/general";
import { Label } from "@/app/_shadcn/components/ui/label";
import { Input } from "@/app/_shadcn/components/ui/input";
import FormError from "../general/FormError";
import { Textarea } from "@/app/_shadcn/components/ui/textarea";
import { sendDocumentAction } from "@/app/_lib/serverActions/document";
import {
  DocumentWithPartners,
  SendDocumentModel
} from "@/app/_lib/types/document";
import { Badge } from "@/app/_shadcn/components/ui/badge";
import { X } from "lucide-react";
import { getEmailSettingsAction } from "@/app/_lib/serverActions/emailSettings";
import { EmailSchema } from "@/app/_lib/validation/general";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";

interface ComponentProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  document: DocumentWithPartners;
}

export default function SendViaEmailDialog({
  isOpen,
  setIsOpen,
  document
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const { isLoading, setIsLoading } = useFormState();

  const [to, setTo, toError, setToError] = useInputValue("");
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

  async function sendDocument(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const zResEmail = EmailSchema.safeParse(to);

    if (!zResEmail.success) setToError(dict.errors.invalidEmail);

    if (!zResEmail.success) return;

    const model: SendDocumentModel = {
      to: zResEmail.data,
      cc,
      subject,
      message
    };

    setIsLoading(true);
    const res = await sendDocumentAction(document.id, model);
    setIsLoading(false);

    if (res.ok) {
      toastHelper.success(dict);
      setIsOpen(false);
    } else toastHelper.error(dict);
  }

  useEffect(() => {
    setTo(document.recipient?.email || "");
    setCcInput("");
    getEmailSettingsAction(document.type)
      .then((res) => {
        if (!res.data) return;

        setCc(res.data.cc?.split(",")?.filter(Boolean) ?? []);
        setSubject(res.data.subject);
        setMessage(res.data.message);
      })
      .catch(() => {
        setCc([]);
        setSubject("");
        setMessage("");
      });
  }, [isOpen, document.type, document.recipient?.email]);

  return (
    <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.labels.sendViaEmail}</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto">
          <div className="p-6 flex flex-col gap-6 bg-secondary rounded-3xl">
            <div>
              <Label htmlFor="to">{dict.labels.to}</Label>
              <Input
                id="to"
                type="text"
                className="mt-2"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                aria-invalid={!!toError}
              />
              <FormError error={toError} className="mt-1" />
            </div>
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
        <DialogFooter>
          <Button
            disabled={isLoading}
            isLoading={isLoading}
            type="submit"
            className="w-36"
            onClick={sendDocument}
          >
            {dict.labels.send}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
