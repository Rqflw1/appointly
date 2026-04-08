"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/app/_shadcn/components/ui/popover";
import { buttonVariants } from "@/app/_shadcn/components/ui/button";
import { cn } from "@/app/_shadcn/lib/utils";
import { Calendar } from "@/app/_shadcn/components/ui/calendar";
import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { DateRange } from "react-day-picker";
import { formatDate } from "@/app/_lib/functions/general";

interface ComponentProps {
  className?: string;
  value: DateRange;
  onChange?: (value: DateRange | undefined) => void;
}

export default function DateRangePicker({
  className,
  value,
  onChange
}: ComponentProps) {
  const { dict, language } = useContext(LocaleContext);

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "input" }),
          "justify-start",
          className
        )}
      >
        <CalendarIcon />
        {value.from && value.to && (
          <span>{`${formatDate(value.from, language)} - ${formatDate(
            value.to,
            language
          )}`}</span>
        )}
        {value.from && !value.to && (
          <span>{`${formatDate(value.from, language)} -`}</span>
        )}
        {!value.from && !value.to && <span>{dict.labels.pickADate}</span>}
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Calendar
          mode="range"
          showOutsideDays={false}
          defaultMonth={value.from}
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
