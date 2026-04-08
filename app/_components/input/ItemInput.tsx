"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/app/_lib/hooks/useDebounce";
import { getItemsAction } from "@/app/_lib/serverActions/item";
import InputWithDropdown from "./InputWithDropdown";
import { Item } from "@/app/_prisma/browser";

interface ComponentProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (option: Item) => void;
  onClose: () => void;
  "aria-invalid"?: boolean;
}

export default function ItemInput({
  value,
  onChange,
  onSelect,
  onClose,
  "aria-invalid": ariaInvalid
}: ComponentProps) {
  const valueDebounced = useDebounce(value);

  const [options, setOptions] = useState<Item[]>([]);

  useEffect(() => {
    getItemsAction(valueDebounced)
      .then((res) => res.data && setOptions(res.data))
      .catch(() => {});
  }, [valueDebounced]);

  return (
    <InputWithDropdown
      type="text"
      value={value}
      options={options}
      renderValue={(value) => value}
      renderOption={(option) => (
        <div>
          <div>{option.name}</div>
          <div className="text-2xs">{option.sku}</div>
        </div>
      )}
      onChange={onChange}
      onSelect={onSelect}
      onClose={onClose}
      aria-invalid={ariaInvalid}
    />
  );
}
