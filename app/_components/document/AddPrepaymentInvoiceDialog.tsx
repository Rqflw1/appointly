"use client";

import { v4 as uuidv4 } from "uuid";
import { Button } from "@/app/_shadcn/components/ui/button";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { SetState } from "@/app/_lib/types/general";
import { cn } from "@/app/_shadcn/lib/utils";
import { Label } from "@/app/_shadcn/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";
import DocumentInput from "../input/DocumentInput";
import { Document } from "@/app/_prisma/browser";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import FormError from "../general/FormError";
import NumberInput from "../input/NumberInput";
import { toFixed } from "@/app/_lib/functions/general";
import { CreateDocumentSettlementRow } from "@/app/_lib/types/document";

interface ComponentProps {
  setFromDocuments: SetState<CreateDocumentSettlementRow[]>;
}

export default function AddPrepaymentInvoiceDialog({
  setFromDocuments
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [isOpen, setIsOpen] = useState(false);

  const [document, setDocument, documentError, setDocumentError] =
    useInputValue<Document | null>(null);
  const [amount, setAmount, amountError, setAmountError] = useInputValue("");

  async function saveData(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const amountFloat = parseFloat(amount);

    if (!document) setDocumentError(dict.errors.documentIdRequired);
    if (Number.isNaN(amountFloat) || amountFloat <= 0)
      setAmountError(dict.errors.amountMustBe);
    // if (document && amountFloat > document.grossTotal)
    //   setAmountError(dict.errors.amountMustBe);

    if (!document) return;
    if (Number.isNaN(amountFloat) || amountFloat <= 0) return;
    // if (document && amountFloat > document.grossTotal) return;

    setFromDocuments((old) => [
      ...old,
      { rowId: uuidv4(), fromDocument: document, amount: -amountFloat }
    ]);

    setIsOpen(false);
  }

  useEffect(() => {
    setDocument(null);
    setAmount("");
  }, [isOpen]);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div
          className="h-10 w-full px-4 flex justify-center items-center bg-input text-secondary-foreground rounded-xl border border-border hover:bg-hover"
          onClick={() => setIsOpen(true)}
        >
          {dict.labels.addPrepaymentInvoice}
        </div>
      </div>
      <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dict.labels.addPrepaymentInvoice}</DialogTitle>
          </DialogHeader>
          <div className="p-6 flex flex-col gap-6 bg-secondary rounded-3xl">
            <div>
              <Label htmlFor="document">{dict.labels.document}</Label>
              <DocumentInput
                className="mt-2"
                selected={document}
                onSelect={(option) => {
                  setDocument(option);
                  if (option) setAmount(toFixed(option.grossTotal, 2));
                }}
                aria-invalid={!!documentError}
              />
              <FormError error={documentError} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="amount">{dict.labels.amount}</Label>
              <NumberInput
                id="amount"
                className="mt-2"
                value={amount}
                onChange={(value) => setAmount(value)}
                onBlur={() => setAmount(toFixed(parseFloat(amount), 2))}
                aria-invalid={!!amountError}
              />
              <FormError error={amountError} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-36" onClick={saveData}>
              {dict.labels.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface DataRowProps {
  className?: string;
  value: string;
  placeholder: string;
}

function DataRow({ className, value, placeholder }: DataRowProps) {
  return (
    <div className={cn({ "text-secondary-foreground": !value }, className)}>
      {value || placeholder}
    </div>
  );
}
