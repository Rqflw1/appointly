"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { Plus } from "lucide-react";
import { PaymentMethodType } from "@/app/_prisma/enums";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import PaymentMethodForm from "../paymentMethod/PaymentMethodForm";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";
import { SetState } from "@/app/_lib/types/general";

interface ComponentProps {
  showPaymentMethodInput?: boolean;
  isPartner?: boolean;
  partnerRegNum?: string;
  showShowByDefaultCheckbox?: boolean;
  save: (
    typeInput: [PaymentMethodType, SetState<PaymentMethodType>],
    nameInput: [string, SetState<string>, string, SetState<string>],
    accNumInput: [string, SetState<string>, string, SetState<string>],
    noteInput: [string, SetState<string>],
    showByDefaultInput: [boolean, SetState<boolean>],
    field_1Input: [string, SetState<string>],
    setIsLoading: SetState<boolean>,
    setIsOpen: SetState<boolean>
  ) => Promise<void>;
}

export default function NewPaymentMethodDialog({
  showPaymentMethodInput,
  isPartner,
  partnerRegNum,
  showShowByDefaultCheckbox,
  save: saveProp
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, setIsLoading } = useFormState();

  const [type, setType] = useInputValue<PaymentMethodType>(
    PaymentMethodType.BANK
  );
  const [name, setName, nameError, setNameError] = useInputValue("");
  const [accNum, setAccNum, accNumError, setAccNumError] = useInputValue("");
  const [note, setNote] = useInputValue("");
  const [showByDefault, setShowByDefault] = useState(true);
  const [field_1, setField_1] = useInputValue("");

  async function save(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    await saveProp(
      [type, setType],
      [name, setName, nameError, setNameError],
      [accNum, setAccNum, accNumError, setAccNumError],
      [note, setNote],
      [showByDefault, setShowByDefault],
      [field_1, setField_1],
      setIsLoading,
      setIsOpen
    );
  }

  useEffect(() => {
    setType(PaymentMethodType.BANK);
    setName("");
    setAccNum("");
    setNote("");
    setShowByDefault(true);
    setField_1("");
  }, [isOpen]);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        <Plus />
        <span>{dict.labels.addMethod}</span>
      </Button>
      <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dict.labels.addMethod}</DialogTitle>
          </DialogHeader>
          <PaymentMethodForm
            showPaymentMethodInput={showPaymentMethodInput}
            isPartner={isPartner}
            partnerRegNum={partnerRegNum}
            showShowByDefaultCheckbox={showShowByDefaultCheckbox}
            typeInput={[type, setType]}
            nameInput={[name, setName, nameError]}
            accNumInput={[accNum, setAccNum, accNumError]}
            noteInput={[note, setNote]}
            showByDefaultInput={[showByDefault, setShowByDefault]}
            field_1Input={[field_1, setField_1]}
          />
          <DialogFooter>
            <Button
              disabled={isLoading}
              isLoading={isLoading}
              type="submit"
              className="w-36"
              onClick={save}
            >
              {dict.labels.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
