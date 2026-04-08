"use client";

import { cn } from "@/app/_shadcn/lib/utils";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/app/_shadcn/components/ui/popover";
import { LocaleContext } from "../context/LocaleProvider";
import { Input } from "@/app/_shadcn/components/ui/input";
import NumberInput from "./NumberInput";

interface ComponentProps<T> {
  type: "text" | "number";
  className?: string;
  contentClassName?: string;
  value: string;
  selected?: T;
  options: T[];
  renderValue: (value: string, selected?: T) => string;
  renderOption: (option: T) => ReactNode;
  getIsSelected?: (
    value: string,
    selected: T | undefined,
    option: T
  ) => boolean;
  onChange: (value: string) => void;
  onSelect: (option: T) => void;
  onClose?: () => void;
  "aria-invalid"?: boolean;
}

export default function InputWithDropdown<T>({
  className,
  contentClassName,
  type,
  value,
  selected,
  options,
  renderValue,
  renderOption,
  getIsSelected,
  onChange,
  onSelect,
  onClose,
  "aria-invalid": ariaInvalid
}: ComponentProps<T>) {
  const { dict } = useContext(LocaleContext);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 0);
    else setTimeout(() => inputRef.current?.blur(), 0);

    if (!isOpen && onClose) onClose();
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <PopoverTrigger asChild>
        <div className={cn("relative flex items-center", className)}>
          <ChevronsUpDown className="pointer-events-none absolute right-3 size-4 text-secondary-foreground" />
          {!isOpen && (
            <div
              className={cn(
                "h-10 w-full pl-4 pr-8 flex items-center bg-input text-secondary-foreground rounded-lg border border-border text-xs transition-all cursor-pointer",
                "aria-invalid:border-destructive"
              )}
              aria-invalid={ariaInvalid}
            >
              {renderValue(value, selected)}
            </div>
          )}
          {isOpen && (
            <>
              {type === "text" && (
                <Input
                  ref={inputRef}
                  className="w-full pr-8"
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  aria-invalid={ariaInvalid}
                />
              )}
              {type === "number" && (
                <NumberInput
                  ref={inputRef}
                  className="w-full pr-8"
                  value={value}
                  onChange={onChange}
                  aria-invalid={ariaInvalid}
                />
              )}
            </>
          )}
        </div>
      </PopoverTrigger>
      <div ref={setContainerRef} />
      <PopoverContent
        container={containerRef}
        align="start"
        className={cn(
          "w-[var(--radix-popover-trigger-width)]",
          contentClassName
        )}
      >
        {options.map((option, key) => {
          const isSelected =
            getIsSelected && getIsSelected(value, selected, option);

          return (
            <div
              key={key}
              className={cn(
                "relative p-2 flex items-center gap-2 text-xs cursor-pointer select-none rounded-md",
                "hover:bg-hover",
                "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
              )}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
            >
              <div className="flex-1 pr-6">{renderOption(option)}</div>
              {isSelected && <Check className="absolute right-2" />}
            </div>
          );
        })}
        {options.length === 0 && (
          <div className="p-2 flex items-center text-xs select-none rounded-md">
            {dict.labels.noResults}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
