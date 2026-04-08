"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useContext,
  useEffect
} from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { PaymentMethodType } from "@/app/_prisma/enums";
import { CreatePaymentMethodModel } from "@/app/_lib/types/paymentMethod";
import PaymentMethodForm from "../paymentMethod/PaymentMethodForm";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";
import { SetState } from "@/app/_lib/types/general";
import { useFormState } from "@/app/_lib/hooks/useFormState";

interface ComponentProps {
  showPaymentMethodInput?: boolean;
  isPartner?: boolean;
  partnerRegNum?: string;

  showShowByDefaultCheckbox?: boolean;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isCopy: boolean;
  paymentMethod: CreatePaymentMethodModel;

  save: (
    typeInput: [PaymentMethodType, SetState<PaymentMethodType>],
    nameInput: [string, SetState<string>, string, SetState<string>],
    accNumInput: [string, SetState<string>, string, SetState<string>],
    noteInput: [string, SetState<string>],
    showByDefaultInput: [boolean, SetState<boolean>],
    field_1Input: [string, SetState<string>],
    setIsLoading: SetState<boolean>
  ) => Promise<void>;
}

export default function CopyOrEditPaymentMethodDialog({
  showPaymentMethodInput,
  isPartner,
  partnerRegNum,
  showShowByDefaultCheckbox,
  isOpen,
  setIsOpen,
  isCopy,
  paymentMethod,
  save: saveProp
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const { isLoading, setIsLoading } = useFormState();

  const [type, setType] = useInputValue<PaymentMethodType>(
    PaymentMethodType.BANK
  );
  const [name, setName, nameError, setNameError] = useInputValue("");
  const [accNum, setAccNum, accNumError, setAccNumError] = useInputValue("");
  const [note, setNote] = useInputValue("");
  const [showByDefault, setShowByDefault] = useInputValue(true);
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
      setIsLoading
    );
  }

  useEffect(() => {
    setType(paymentMethod.type);
    setName(paymentMethod.name);
    setAccNum(paymentMethod.accNum);
    setNote(paymentMethod.note);
    setShowByDefault(paymentMethod.showByDefault);
    setField_1(paymentMethod.field_1);
  }, [isOpen, paymentMethod]);

  return (
    <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCopy ? dict.labels.addMethod : dict.labels.editMethod}
          </DialogTitle>
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
  );
}
