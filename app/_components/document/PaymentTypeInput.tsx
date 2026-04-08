"use client";

import { useContext, useEffect, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { SetState } from "@/app/_lib/types/general";
import InputWithDropdown from "../input/InputWithDropdown";
import { paymentTypes } from "@/app/_lib/constants/general";
import z from "zod";
import { Label } from "@/app/_shadcn/components/ui/label";
import { PaymentMethodType } from "@/app/_prisma/enums";

interface ComponentProps {
  typeInput: [string, SetState<string>];
}
export default function PaymentTypeInput({
  typeInput: [typeProp, setTypeProp]
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [type, setType] = useState(typeProp);

  useEffect(() => setType(typeProp), [typeProp]);

  return (
    <div className="flex gap-6">
      <div className="w-48">
        <Label htmlFor="type">{dict.labels.paymentType}</Label>
        <InputWithDropdown
          type="text"
          className="mt-2 w-full"
          value={type}
          options={[null, ...paymentTypes]}
          renderValue={(value) => {
            if (!value) return dict.labels.none;
            const zRes = z.enum(PaymentMethodType).safeParse(value);
            if (zRes.success) return dict.paymentMethodType[zRes.data];
            return value;
          }}
          renderOption={(option) => {
            if (option === null) return dict.labels.none;
            return dict.paymentMethodType[option];
          }}
          getIsSelected={(value, _, option) => {
            if (!value && option === null) return true;
            if (value === option) return true;
            if (value && option === PaymentMethodType.OTHER) return true;
            return false;
          }}
          onChange={(value) => setType(value)}
          onSelect={(option) => {
            if (option === null) return setType("");
            setType(option);
          }}
          onClose={() => setTypeProp(type)}
        />
      </div>
    </div>
  );
}
