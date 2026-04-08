"use client";

import { useContext, useEffect, useState } from "react";
import { useDebounce } from "@/app/_lib/hooks/useDebounce";
import { PaymentMethod } from "@/app/_prisma/browser";
import InputWithDropdown from "./InputWithDropdown";
import { LocaleContext } from "../context/LocaleProvider";
import { getPaymentMethodsAction } from "@/app/_lib/serverActions/paymentMethod";

interface ComponentProps {
  isPartner?: boolean;
  partnerRegNum?: string;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (option: PaymentMethod) => void;
  "aria-invalid"?: boolean;
}

export default function PaymentMethodInput({
  isPartner,
  partnerRegNum,
  className,
  value,
  onChange,
  onSelect,
  "aria-invalid": ariaInvalid
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);
  const valueDebounced = useDebounce(value);

  const [options, setOptions] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    getPaymentMethodsAction(!!isPartner, partnerRegNum || "", valueDebounced)
      .then((res) => res.data && setOptions(res.data))
      .catch(() => {});
  }, [isPartner, partnerRegNum, valueDebounced]);

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
          <div className="text-2xs">
            {dict.paymentMethodType[option.type]} - {option.accNum}
          </div>
        </div>
      )}
      onChange={onChange}
      onSelect={onSelect}
      aria-invalid={ariaInvalid}
    />
  );
}
