"use client";

import { FocusEvent } from "react";
import { Input } from "@/app/_shadcn/components/ui/input";
import { HexColorPicker } from "react-colorful";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/app/_shadcn/components/ui/popover";
import { cn } from "@/app/_shadcn/lib/utils";

interface ComponentProps {
  color: string;
  onChange: (value: string) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement, Element>) => void;
  className?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
}

export default function ColorPicker({
  color,
  onChange,
  onBlur,
  className,
  disabled,
  "aria-invalid": ariaInvalid
}: ComponentProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Input
        disabled={disabled}
        id="color"
        type="text"
        className="w-28"
        value={color}
        onChange={(e) => {
          const value = e.target.value.replace(/[^a-fA-F0-9]/g, "");
          onChange(`#${value.slice(0, 6)}`);
        }}
        onBlur={onBlur}
        aria-invalid={ariaInvalid}
      />
      <div>
        <Popover>
          <PopoverTrigger
            style={{ backgroundColor: color }}
            disabled={disabled}
            className="block size-10 border border-border rounded-lg disabled:opacity-50"
          />
          <PopoverContent align="start">
            <HexColorPicker color={color} onChange={(e) => onChange(e)} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
