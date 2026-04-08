"use client";

import { Input } from "@/app/_shadcn/components/ui/input";
import { FocusEvent } from "react";
import { formatNumberWithSpaces } from "@/app/_lib/functions/general";

interface ComponentProps
  extends Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> {
  value: string;
  renderValue?: (value: string) => string;
  onChange?: (value: string) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement, Element>) => void;
}

export default function NumberInput({
  value,
  renderValue: renderValueProp,
  onChange,
  onBlur,
  ...props
}: ComponentProps) {
  function renderValue() {
    const number = parseFloat(value);
    if (value && isNaN(number))
      console.warn(`Warning: invalid value '${value}' is parsed to NaN`);

    if (renderValueProp) return renderValueProp(value);
    if (value === "-" || value === "." || value === "-.") return value;
    return isNaN(number) ? "" : formatNumberWithSpaces(value);
  }

  return (
    <Input
      type="text"
      value={renderValue()}
      onChange={(e) => {
        const value = e.target.value
          .replace(/[^\d.-]/g, "")
          .replace(/(?!^)-/g, "")
          .replace(/(\..*)\./g, "$1");
        onChange && onChange(value);
      }}
      onBlur={onBlur}
      {...props}
    />
  );
}
