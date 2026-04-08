"use client";

import { useContext, useEffect, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { SetState } from "@/app/_lib/types/general";
import {
  calculatePriceProps,
  compareNumbers,
  round,
  toFixed,
  toString
} from "@/app/_lib/functions/general";
import { CreateItemModelRow } from "@/app/_lib/types/item";
import InputWithDropdown from "../input/InputWithDropdown";

interface ComponentProps {
  type: "vat" | "discount";
  rateInput: [number, SetState<number>];
  setItems: SetState<CreateItemModelRow[]>;
}
export default function DiscountOrVatInput({
  type,
  rateInput: [rateProp, setRateProp],
  setItems
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [rate, setRate] = useState(toFixed(rateProp * 100, 2));

  useEffect(() => setRate(toFixed(rateProp * 100, 2)), [rateProp]);

  const options =
    type === "vat" ? [NaN, 0, 5, 12, 21] : [0, 5, 10, 15, 20, 25, 30];

  return (
    <InputWithDropdown
      type="number"
      className="w-28"
      value={rate}
      options={options}
      renderValue={(value) => {
        const number = parseFloat(value);
        if (isNaN(number)) return dict.labels.none;
        return `${value} %`;
      }}
      renderOption={(option) => {
        if (isNaN(option)) return dict.labels.none;
        return `${option} %`;
      }}
      getIsSelected={(value, _, option) =>
        compareNumbers(parseFloat(value), option)
      }
      onChange={(value) => setRate(value)}
      onSelect={(option) => setRate(toString(option))}
      onClose={() => {
        let number = round(parseFloat(rate) * 0.01, 4);
        if (type === "discount") number = number || 0;
        setRateProp(number);
        setRate(toFixed(number * 100, 2));
        const key = type === "vat" ? "vatRate" : "discountRate";
        setItems((old) =>
          old.map((row) => {
            const newRow = { ...row, [key]: number };
            return { ...newRow, ...calculatePriceProps(newRow) };
          })
        );
      }}
    />
  );
}
