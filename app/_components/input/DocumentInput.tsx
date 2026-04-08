"use client";

import { useContext, useEffect, useState } from "react";
import { useDebounce } from "@/app/_lib/hooks/useDebounce";
import InputWithDropdown from "./InputWithDropdown";
import { getPrepaymentDocumentsAction } from "@/app/_lib/serverActions/document";
import { Document } from "@/app/_prisma/browser";
import { LocaleContext } from "../context/LocaleProvider";
import { toFixed } from "@/app/_lib/functions/general";
import { amountWithCurrency } from "@/app/_lib/functions/document";

interface ComponentProps {
  className?: string;
  selected: Document | null;
  onSelect: (option: Document | null) => void;
  "aria-invalid"?: boolean;
}

export default function DocumentInput({
  className,
  selected,
  onSelect,
  "aria-invalid": ariaInvalid
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [options, setOptions] = useState<Document[]>([]);
  const [search, setSearch] = useState("");
  const searchDebounced = useDebounce(search);

  useEffect(() => {
    getPrepaymentDocumentsAction(searchDebounced)
      .then((res) => res.data && setOptions(res.data))
      .catch(() => {});
  }, [searchDebounced]);

  return (
    <InputWithDropdown
      className={className}
      type="text"
      value={search}
      selected={selected}
      options={options}
      renderValue={(_, selected) => {
        if (!selected) return "";
        return selected.docNum;
      }}
      renderOption={(option) => {
        if (!option) return dict.labels.none;
        return (
          <div className="flex gap-2">
            <div className="flex-1">
              <div>{option.docNum}</div>
            </div>
            <div>
              {amountWithCurrency(
                toFixed(option.grossTotal, 2),
                option.currency
              )}
            </div>
          </div>
        );
        // return option.docNum;
      }}
      getIsSelected={(_, selected, option) => {
        if (selected === null && option === null) return true;
        if (selected && option && selected.docNum === option.docNum)
          return true;
        return false;
      }}
      onChange={setSearch}
      onSelect={onSelect}
      onClose={() => setSearch("")}
      aria-invalid={ariaInvalid}
    />
  );
}
