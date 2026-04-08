"use client";

import { cn } from "@/app/_shadcn/lib/utils";
import { ReactNode, useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/app/_shadcn/components/ui/dropdown-menu";
import { buttonVariants } from "@/app/_shadcn/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";

interface ComponentProps<T> {
  className?: string;
  placeholder?: ReactNode;
  selected: T;
  options: T[];
  getOptionUniqueId?: (option: T) => string;
  renderSelected?: (option: T) => ReactNode;
  renderOption?: (option: T) => ReactNode;
  onChange?: (value: T) => void;
  "aria-invalid"?: boolean;
}

export default function DropdownInput<T>({
  className,
  placeholder,
  selected,
  options,
  getOptionUniqueId,
  renderSelected: renderSelectedProp,
  renderOption,
  onChange,
  "aria-invalid": ariaInvalid
}: ComponentProps<T>) {
  const { dict } = useContext(LocaleContext);

  function getUniqueId(option: T) {
    if (getOptionUniqueId) return getOptionUniqueId(option);
    return String(option);
  }

  function renderSelected() {
    if (renderSelectedProp) return renderSelectedProp(selected);
    if (renderOption) return renderOption(selected);
    return String(selected);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "input" }),
          "inline-flex justify-between aria-invalid:border-destructive",
          className
        )}
        aria-invalid={ariaInvalid}
      >
        {selected !== null && renderSelected()}
        {selected === null && (placeholder || dict.labels.select)}
        <ChevronsUpDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[var(--radix-dropdown-menu-trigger-width)]"
        align="start"
      >
        {options.map((option, key) => {
          const isSelected = getUniqueId(option) === getUniqueId(selected);

          return (
            <DropdownMenuItem
              key={key}
              onClick={() => onChange && onChange(option)}
            >
              <div>
                {(renderOption && renderOption(option)) || String(option)}
              </div>
              {isSelected && (
                <DropdownMenuShortcut>
                  <Check />
                </DropdownMenuShortcut>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
