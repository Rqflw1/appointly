"use client";

import { useEffect, useState } from "react";
import { SetState } from "@/app/_lib/types/general";
import NumberInput from "../input/NumberInput";
import { round, toFixed } from "@/app/_lib/functions/general";

interface ComponentProps {
  currencyRateInput: [number, SetState<number>];
}

export default function CurrencyRateInput({
  currencyRateInput: [rateProp, setRateProp]
}: ComponentProps) {
  const [rate, setRate] = useState(toFixed(rateProp, 4));

  useEffect(() => setRate(toFixed(rateProp, 4)), [rateProp]);

  return (
    <NumberInput
      id="currencyRate"
      className="w-32"
      value={rate}
      onChange={setRate}
      onBlur={() => {
        const number = round(parseFloat(rate), 4) || 0;
        setRateProp(number);
        setRate(toFixed(number, 4));
      }}
    />
  );
}
