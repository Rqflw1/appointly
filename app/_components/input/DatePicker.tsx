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
import { useContext, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { formatDate } from "@/app/_lib/functions/general";

interface ComponentProps {
  className?: string;
  value?: Date;
  onChange?: (value: Date | undefined) => void;
}

export default function DatePicker({
  className,
  value,
  onChange
}: ComponentProps) {
  const { dict, language } = useContext(LocaleContext);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "input" }),
          "justify-start",
          className
        )}
      >
        <CalendarIcon />
        {value && <span>{formatDate(value, language)}</span>}
        {!value && <span>{dict.labels.pickADate}</span>}
      </PopoverTrigger>
      <div ref={setContainerRef} />
      <PopoverContent container={containerRef} className="p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value}
          // onSelect={onChange}
          onSelect={(value) => {
            onChange && onChange(value);
            setIsOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
