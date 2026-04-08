"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { Label } from "@/app/_shadcn/components/ui/label";
import { Input } from "@/app/_shadcn/components/ui/input";
import DatePicker from "../input/DatePicker";
import DateRangePicker from "../input/DateRangePicker";
import {
  compareNumbers,
  formatDate,
  formatDateShortWithYear,
  round,
  toFixed,
  toString
} from "@/app/_lib/functions/general";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { SetState } from "@/app/_lib/types/general";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";
import InputWithDropdown from "../input/InputWithDropdown";
import {
  shiftDateToLocal,
  shiftDateToUTC
} from "@/app/_lib/functions/document";
import { DateRange } from "react-day-picker";
import { DocumentType } from "@/app/_prisma/enums";

interface ComponentProps {
  type: DocumentType;
  docNumInput: [string, SetState<string>];
  docDateInput: [Date, SetState<Date>];
  dateFromInput: [Date | null, SetState<Date | null>];
  dateToInput: [Date | null, SetState<Date | null>];
  dueDateInput: [Date, SetState<Date>];
  duePeriodInput: [number, SetState<number>];
  lateFeeRateInput: [number, SetState<number>];
}

export default function MainInfoDialog({
  type,
  docNumInput: [docNumProp, setDocNumProp],
  docDateInput: [docDateProp, setDocDateProp],
  dateFromInput: [dateFromProp, setDateFromProp],
  dateToInput: [dateToProp, setDateToProp],
  dueDateInput: [dueDateProp, setDueDateProp],
  duePeriodInput: [duePeriodProp, setDuePeriodProp],
  lateFeeRateInput: [lateFeeRateProp, setLateFeeRateProp]
}: ComponentProps) {
  const { dict, language } = useContext(LocaleContext);

  const [isOpen, setIsOpen] = useState(false);

  const [docNum, setDocNum] = useInputValue("");
  const [docDate, setDocDate] = useInputValue(new Date());
  const [dateFrom, setDateFrom] = useInputValue<Date | null>(null);
  const [dateTo, setDateTo] = useInputValue<Date | null>(null);
  const [dueDate, setDueDate] = useInputValue(new Date());
  const [duePeriod, setDuePeriod] = useInputValue("");
  const [lateFeeRate, setLateFeeRate] = useInputValue("0");

  function onDateRangeChange(value: DateRange | undefined) {
    const nextFrom = value?.from ? shiftDateToUTC(value.from) : null;
    const nextTo = value?.to ? shiftDateToUTC(value.to) : null;
    setDateFrom(nextFrom);
    setDateTo(nextTo);
  }

  function saveData(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    setDocNumProp(docNum);
    setDocDateProp(docDate);
    setDateFromProp(dateFrom);
    setDateToProp(dateTo);
    setDueDateProp(dueDate);
    setDuePeriodProp(round(parseFloat(duePeriod), 0));
    setLateFeeRateProp(round(parseFloat(lateFeeRate) * 0.01, 4));

    setIsOpen(false);
  }

  useEffect(() => {
    setDocNum(docNumProp);
    setDocDate(docDateProp);
    setDateFrom(dateFromProp);
    setDateTo(dateToProp);
    setDueDate(dueDateProp);
    setDuePeriod(toFixed(duePeriodProp, 0));
    setLateFeeRate(toFixed(lateFeeRateProp * 100, 2));
  }, [
    isOpen,
    docNumProp,
    docDateProp,
    dateFromProp,
    dateToProp,
    dueDateProp,
    duePeriodProp,
    lateFeeRateProp
  ]);

  return (
    <div>
      <div
        className="min-h-48 p-8 flex flex-col gap-2 rounded-3xl border border-border hover:bg-hover"
        onClick={() => setIsOpen(true)}
      >
        <div className="text-lg font-semibold text-right">
          {dict.documentType[type]}
        </div>
        <div className="flex justify-between gap-2">
          <div className="text-sm text-secondary-foreground">
            {dict.documentNumber[type]}:
          </div>
          <div className="font-medium">{docNumProp}</div>
        </div>
        {dateFromProp && dateToProp && (
          <div className="flex justify-between gap-2">
            <div className="text-sm text-secondary-foreground">
              {dict.documentPeriod[type]}:
            </div>
            <div>
              {`${formatDateShortWithYear(
                shiftDateToLocal(dateFromProp),
                language
              )} - ${formatDateShortWithYear(shiftDateToLocal(dateToProp), language)}`}
            </div>
          </div>
        )}
        <div className="flex justify-between gap-2">
          <div className="text-sm text-secondary-foreground">
            {dict.documentDate[type]}:
          </div>
          <div>{formatDate(shiftDateToLocal(docDateProp), language)}</div>
        </div>
        <div className="flex justify-between gap-2 font-semibold">
          <div className="text-sm text-secondary-foreground">
            {dict.labels.dueDate}:
          </div>
          <div>{formatDate(shiftDateToLocal(dueDateProp), language)}</div>
        </div>
        <div className="flex justify-between gap-2">
          <div className="text-sm text-secondary-foreground">
            {dict.labels.lateFeeRate}:
          </div>
          <div>{`${toFixed(lateFeeRateProp * 100, 2)} %`}</div>
        </div>
      </div>
      <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dict.labels.documentNumberAndDate}</DialogTitle>
          </DialogHeader>
          <div className="p-6 flex flex-col gap-6 bg-secondary rounded-3xl">
            <div>
              <Label htmlFor="docNum">{dict.labels.documentNumber}</Label>
              <Input
                id="docNum"
                type="text"
                className="mt-2"
                value={docNum}
                onChange={(e) => setDocNum(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="documentPeriod">
                {dict.labels.documentPeriod}
              </Label>
              <DateRangePicker
                className="mt-2 w-full"
                value={{
                  from: dateFrom ? shiftDateToLocal(dateFrom) : undefined,
                  to: dateTo ? shiftDateToLocal(dateTo) : undefined
                }}
                onChange={onDateRangeChange}
              />
            </div>
            <div>
              <Label htmlFor="docDate">{dict.labels.documentDate}</Label>
              <DatePicker
                className="mt-2 w-full"
                value={shiftDateToLocal(docDate)}
                onChange={(value) => {
                  if (!value) return;
                  const utcDate = shiftDateToUTC(value);
                  setDocDate(utcDate);
                  const number = round(parseFloat(duePeriod) || 0, 0);
                  const nextDueDate = new Date(utcDate);
                  nextDueDate.setDate(utcDate.getDate() + number);
                  setDueDate(nextDueDate);
                }}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="dueDate">{dict.labels.dueDate}</Label>
                <DatePicker
                  className="mt-2 w-full"
                  value={shiftDateToLocal(dueDate)}
                  onChange={(value) => {
                    if (!value) return;
                    const utcDate = shiftDateToUTC(value);
                    setDueDate(utcDate);
                    const diff = utcDate.getTime() - docDate.getTime();
                    setDuePeriod(toFixed(diff / (1000 * 60 * 60 * 24), 0));
                  }}
                />
              </div>
              <div className="w-32">
                <Label htmlFor="duePeriod">{dict.labels.duePeriod}</Label>
                <InputWithDropdown
                  type="number"
                  className="w-full mt-2"
                  value={duePeriod}
                  options={[0, 1, 5, 7, 10, 14, 21, 30]}
                  renderValue={(value) => {
                    const number = parseFloat(value);
                    if (isNaN(number)) return "";
                    if (number === 0) return dict.labels.sameDay;
                    return `${value} ${dict.labels.days}`;
                  }}
                  renderOption={(option) => {
                    if (option === 0) return dict.labels.sameDay;
                    return `${option} ${dict.labels.days}`;
                  }}
                  getIsSelected={(value, _, option) =>
                    compareNumbers(parseFloat(value), option)
                  }
                  onChange={(value) => setDuePeriod(value)}
                  onSelect={(option) => setDuePeriod(toString(option))}
                  onClose={() => {
                    const number = round(parseFloat(duePeriod) || 0, 0);
                    setDuePeriod(toFixed(number, 0));
                    const dueDate = new Date(docDate);
                    dueDate.setDate(docDate.getDate() + number);
                    setDueDate(dueDate);
                  }}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lateFeeRate">{dict.labels.lateFeeRate}</Label>
              <InputWithDropdown
                type="number"
                className="w-full mt-2"
                value={lateFeeRate}
                options={[0, 0.05, 0.1, 0.2, 0.3, 0.5]}
                renderValue={(value) => {
                  const number = parseFloat(value);
                  if (isNaN(number)) return "";
                  return `${value} %`;
                }}
                renderOption={(option) => `${option} %`}
                getIsSelected={(value, _, option) =>
                  compareNumbers(parseFloat(value), option)
                }
                onChange={(value) => setLateFeeRate(value)}
                onSelect={(option) => setLateFeeRate(toString(option))}
                onClose={() =>
                  setLateFeeRate(toFixed(parseFloat(lateFeeRate) || 0, 2))
                }
              />
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
