"use client";

import { useEffect, useState } from "react";
import { countries, Country } from "@/app/_lib/constants/countries";
import { useDebounce } from "@/app/_lib/hooks/useDebounce";
import { removeDiacritics } from "@/app/_lib/functions/general";
import InputWithDropdown from "./InputWithDropdown";

interface ComponentProps {
  className?: string;
  selected: Country;
  onSelect: (option: Country) => void;
  "aria-invalid"?: boolean;
}

export default function CountryInput({
  className,
  selected,
  onSelect,
  "aria-invalid": ariaInvalid
}: ComponentProps) {
  const [options, setOptions] = useState(countries);
  const [search, setSearch] = useState("");
  const searchDebounced = useDebounce(search);

  useEffect(() => {
    if (searchDebounced)
      setOptions(
        countries.filter(({ name }) => {
          name = removeDiacritics(name).toLowerCase();
          const search = removeDiacritics(searchDebounced).toLowerCase();
          return name.includes(search);
        })
      );
    else setOptions(countries);
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
        return selected.name;
      }}
      renderOption={({ name }) => name}
      getIsSelected={(_, selected, option) => selected?.iso2 === option.iso2}
      onChange={setSearch}
      onSelect={onSelect}
      onClose={() => setSearch("")}
      aria-invalid={ariaInvalid}
    />
  );
}
