"use client";

import { Label } from "@/app/_shadcn/components/ui/label";
import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import DropdownInput from "../input/DropdownInput";
import FormError from "../general/FormError";
import { Input } from "@/app/_shadcn/components/ui/input";
import { SetState } from "@/app/_lib/types/general";
import { PaymentMethodType } from "@/app/_prisma/enums";
import { paymentTypes } from "@/app/_lib/constants/general";
import { Checkbox } from "@/app/_shadcn/components/ui/checkbox";
import PaymentMethodInput from "../input/PaymentMethodInput";
import { PaymentMethod } from "@/app/_prisma/browser";

interface ComponentProps {
  showPaymentMethodInput?: boolean;
  isPartner?: boolean;
  partnerRegNum?: string;
  showShowByDefaultCheckbox?: boolean;
  typeInput: [PaymentMethodType, SetState<PaymentMethodType>];
  nameInput: [string, SetState<string>, string];
  accNumInput: [string, SetState<string>, string];
  noteInput: [string, SetState<string>];
  showByDefaultInput: [boolean, SetState<boolean>];
  field_1Input: [string, SetState<string>];
}

export default function PaymentMethodForm({
  showPaymentMethodInput,
  isPartner,
  partnerRegNum,
  showShowByDefaultCheckbox,
  typeInput: [type, setType],
  nameInput: [name, setName, nameError],
  accNumInput: [accNum, setAccNum, accNumError],
  noteInput: [note, setNote],
  showByDefaultInput: [showByDefault, setShowByDefault],
  field_1Input: [field_1, setField_1]
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  function onPaymentMethodSelect(option: PaymentMethod) {
    setType(option.type);
    setName(option.name);
    setAccNum(option.accNum);
    setNote(option.note);
    setField_1(option.field_1);
  }

  return (
    <div className="p-6 flex flex-col gap-6 bg-secondary rounded-3xl">
      <div>
        <Label htmlFor="type">{dict.labels.type}</Label>
        <DropdownInput
          className="mt-2 w-full"
          selected={type}
          options={paymentTypes}
          renderOption={(option) => dict.paymentMethodType[option]}
          onChange={(option) => option && setType(option)}
        />
      </div>
      <div>
        <Label htmlFor="name">{dict.labels.itemName}</Label>
        <Input
          id="name"
          type="text"
          className="mt-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!nameError}
        />
        <FormError error={nameError} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="accNum">{dict.paymentMethod.accNumOrId[type]}</Label>
        {!showPaymentMethodInput && (
          <Input
            id="accNum"
            type="text"
            className="mt-2"
            value={accNum}
            onChange={(e) => setAccNum(e.target.value)}
            aria-invalid={!!accNumError}
          />
        )}
        {showPaymentMethodInput && (
          <PaymentMethodInput
            className="mt-2"
            isPartner={isPartner}
            partnerRegNum={partnerRegNum}
            value={accNum}
            onChange={(value) => setAccNum(value)}
            onSelect={onPaymentMethodSelect}
            aria-invalid={!!accNumError}
          />
        )}
        <FormError error={accNumError} className="mt-1" />
      </div>
      {type === PaymentMethodType.BANK && (
        <div>
          <Label htmlFor="field_1">{dict.paymentMethod.field_1[type]}</Label>
          <Input
            id="field_1"
            type="text"
            className="mt-2"
            value={field_1}
            onChange={(e) => setField_1(e.target.value)}
          />
        </div>
      )}
      <div>
        <Label htmlFor="note">{dict.labels.note}</Label>
        <Input
          id="note"
          type="text"
          className="mt-2"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      {showShowByDefaultCheckbox && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="showByDefault"
            checked={showByDefault}
            onCheckedChange={(value) => setShowByDefault(!!value)}
          />
          <Label htmlFor="showByDefault">{dict.labels.showByDefault}</Label>
        </div>
      )}
    </div>
  );
}
