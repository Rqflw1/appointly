"use client";

import { v4 as uuidv4 } from "uuid";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/app/_shadcn/components/ui/dropdown-menu";
import { Row } from "@tanstack/react-table";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { CreatePaymentMethodModelRow } from "@/app/_lib/types/paymentMethod";
import { PaymentMethodType } from "@/app/_prisma/browser";
import { SetState } from "@/app/_lib/types/general";
import CopyOrEditPaymentMethodDialog from "../paymentMethod/CopyOrEditPaymentMethodDialog";
import RowActions from "../table/RowActions";

interface ComponentProps {
  showPaymentMethodInput?: boolean;
  isPartner?: boolean;
  partnerRegNum?: string;

  row: Row<CreatePaymentMethodModelRow>;
  setPaymentMethods: Dispatch<SetStateAction<CreatePaymentMethodModelRow[]>>;
}

export default function PaymentMethodRowActions({
  showPaymentMethodInput,
  isPartner,
  partnerRegNum,
  row,
  setPaymentMethods
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [isOpen, setIsOpen] = useState(false);
  const [isCopy, setIsCopy] = useState(false);

  async function save(
    typeInput: [PaymentMethodType, SetState<PaymentMethodType>],
    nameInput: [string, SetState<string>, string, SetState<string>],
    accNumInput: [string, SetState<string>, string, SetState<string>],
    noteInput: [string, SetState<string>],
    showByDefaultInput: [boolean, SetState<boolean>],
    field_1Input: [string, SetState<string>],
    setIsLoading: SetState<boolean>
  ) {
    const [type] = typeInput;
    const [name, , , setNameError] = nameInput;
    const [accNum, , , setAccNumError] = accNumInput;
    const [note] = noteInput;
    const [showByDefault] = showByDefaultInput;
    const [field_1] = field_1Input;

    if (!name) setNameError(dict.errors.nameIsRequired);
    if (!accNum) setAccNumError(dict.errors.nameIsRequired);

    if (!name) return;
    if (!accNum) return;

    if (isCopy)
      setPaymentMethods((old) => [
        ...old,
        { rowId: uuidv4(), type, name, accNum, note, showByDefault, field_1 }
      ]);
    else
      setPaymentMethods((old) =>
        old.map((method) => {
          if (method.rowId !== row.original.rowId) return method;
          return {
            rowId: method.rowId,
            type,
            name,
            accNum,
            note,
            showByDefault,
            field_1
          };
        })
      );

    setIsOpen(false);
  }

  async function deleteRow() {
    setPaymentMethods((old) =>
      old.filter(({ rowId }) => rowId !== row.original.rowId)
    );
  }

  function openDialog(isCopy: boolean) {
    setTimeout(() => {
      setIsCopy(isCopy);
      setIsOpen(true);
    }, 0);
  }

  return (
    <>
      <RowActions>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openDialog(false)}>
            {dict.labels.edit}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog(true)}>
            {dict.labels.copy}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={deleteRow}>
            {dict.labels.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </RowActions>
      <CopyOrEditPaymentMethodDialog
        showPaymentMethodInput={showPaymentMethodInput}
        isPartner={isPartner}
        partnerRegNum={partnerRegNum}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isCopy={isCopy}
        paymentMethod={row.original}
        save={save}
      />
    </>
  );
}
