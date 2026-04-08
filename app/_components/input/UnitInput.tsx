"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/app/_lib/hooks/useDebounce";
import { removeDiacritics } from "@/app/_lib/functions/general";
import InputWithDropdown from "./InputWithDropdown";
import { Unit } from "@/app/_prisma/browser";

interface ComponentProps {
  className?: string;
  units: Unit[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (option: Unit) => void;
  onClose?: () => void;
  "aria-invalid"?: boolean;
}

export default function UnitInput({
  className,
  units,
  value,
  onChange,
  onSelect,
  onClose,
  "aria-invalid": ariaInvalid
}: ComponentProps) {
  const valueDebounced = useDebounce(value);

  const [options, setOptions] = useState(units);

  useEffect(() => {
    if (valueDebounced)
      setOptions(
        units.filter(({ name }) => {
          const unit = removeDiacritics(name).toLowerCase();
          const search = removeDiacritics(valueDebounced).toLowerCase();
          return unit.includes(search);
        })
      );
    else setOptions(units);
  }, [valueDebounced]);

  return (
    <InputWithDropdown
      type="text"
      className={className}
      contentClassName="w-auto min-w-[var(--radix-popover-trigger-width)]"
      value={value}
      options={options}
      renderValue={(value) => value}
      renderOption={(option) => <div>{option.name}</div>}
      onChange={onChange}
      onSelect={onSelect}
      onClose={onClose}
      aria-invalid={ariaInvalid}
    />
  );
}
