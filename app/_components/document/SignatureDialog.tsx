"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { Label } from "@/app/_shadcn/components/ui/label";
import { Input } from "@/app/_shadcn/components/ui/input";
import DatePicker from "../input/DatePicker";
import { formatDate } from "@/app/_lib/functions/general";
import { SetState } from "@/app/_lib/types/general";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";
import { Checkbox } from "@/app/_shadcn/components/ui/checkbox";
import {
  shiftDateToLocal,
  shiftDateToUTC
} from "@/app/_lib/functions/document";

interface ComponentProps {
  nameInput: [string, SetState<string>];
  dateInput: [Date | null, SetState<Date | null>];
  hasLineInput: [boolean, SetState<boolean>];
  showElectronicSignatureNoticeInput: [boolean, SetState<boolean>];
}

export default function SignatureDialog({
  nameInput: [nameProp, setNameProp],
  dateInput: [dateProp, setDateProp],
  hasLineInput: [hasLineProp, setHasLineProp],
  showElectronicSignatureNoticeInput: [
    showElectronicSignatureNoticeProp,
    setShowElectronicSignatureNoticeProp
  ]
}: ComponentProps) {
  const { dict, language } = useContext(LocaleContext);

  const [isOpen, setIsOpen] = useState(false);

  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [hasLine, setHasLine] = useState(true);
  const [showElectronicSignatureNotice, setShowElectronicSignatureNotice] =
    useState(false);

  function saveData(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    setNameProp(name);
    setDateProp(date);
    setHasLineProp(hasLine);
    setShowElectronicSignatureNoticeProp(showElectronicSignatureNotice);

    setIsOpen(false);
  }

  useEffect(() => {
    setName(nameProp);
    setDate(dateProp);
    setHasLine(hasLineProp);
    setShowElectronicSignatureNotice(showElectronicSignatureNoticeProp);
  }, [
    isOpen,
    nameProp,
    dateProp,
    hasLineProp,
    showElectronicSignatureNoticeProp
  ]);

  return (
    <div>
      <div
        className="h-48 p-8 flex flex-col gap-4 rounded-3xl border border-border hover:bg-hover"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex justify-between gap-8">
          <div className="text-sm text-secondary-foreground">
            {dict.labels.name}:
          </div>
          {nameProp && <div>{nameProp}</div>}
          {!nameProp && <div className="flex-1 border-b border-black" />}
        </div>
        <div className="flex justify-between gap-8">
          <div className="text-sm text-secondary-foreground">
            {dict.labels.date}:
          </div>
          {dateProp && <div>{formatDate(dateProp, language)}</div>}
          {!dateProp && <div className="flex-1 border-b border-black" />}
        </div>
        {hasLineProp && (
          <div className="flex justify-between gap-8">
            <div className="text-sm text-secondary-foreground">
              {dict.labels.signature}:
            </div>
            <div className="flex-1 border-b border-black" />
          </div>
        )}
      </div>
      <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dict.labels.documentNumberAndDate}</DialogTitle>
          </DialogHeader>
          <div className="p-6 flex flex-col gap-6 bg-secondary rounded-3xl">
            <div>
              <Label htmlFor="name">{dict.labels.name}</Label>
              <Input
                id="name"
                type="text"
                className="mt-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="date">{dict.labels.date}</Label>
              <DatePicker
                className="mt-2 w-full"
                value={date ? shiftDateToLocal(date) : undefined}
                onChange={(value) =>
                  setDate(value ? shiftDateToUTC(value) : null)
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="hasLine"
                checked={hasLine}
                onCheckedChange={(value) => setHasLine(!!value)}
              />
              <Label htmlFor="hasLine">{dict.labels.signatureLine}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="showElectronicSignatureNotice"
                checked={showElectronicSignatureNotice}
                onCheckedChange={(value) =>
                  setShowElectronicSignatureNotice(!!value)
                }
              />
              <Label htmlFor="showElectronicSignatureNotice">
                {dict.labels.showElectronicSignatureNotice}
              </Label>
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
