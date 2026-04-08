"use client";

import { useEffect, useState } from "react";
import { CompanyWithMethods } from "@/app/_lib/types/company";
import { getPartnersAction } from "@/app/_lib/serverActions/company";
import { useDebounce } from "@/app/_lib/hooks/useDebounce";
import InputWithDropdown from "./InputWithDropdown";

interface ComponentProps {
  className?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (option: CompanyWithMethods) => void;
  "aria-invalid"?: boolean;
}

export default function PartnerInput({
  className,
  value,
  onChange,
  onSelect,
  "aria-invalid": ariaInvalid
}: ComponentProps) {
  const valueDebounced = useDebounce(value);

  const [options, setOptions] = useState<CompanyWithMethods[]>([]);

  useEffect(() => {
    getPartnersAction(valueDebounced)
      .then((res) => res.data && setOptions(res.data))
      .catch(() => {});
  }, [valueDebounced]);

  return (
    <InputWithDropdown
      type="text"
      className={className}
      value={value}
      options={options}
      renderValue={(value) => value}
      renderOption={(option) => (
        <div>
          <div>{option.name}</div>
          <div className="text-2xs">{option.regNum}</div>
        </div>
      )}
      onChange={onChange}
      onSelect={onSelect}
      aria-invalid={ariaInvalid}
    />
  );
}
