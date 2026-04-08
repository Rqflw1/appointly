"use client";

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/app/_shadcn/components/ui/dropdown-menu";
import { Row } from "@tanstack/react-table";
import { PaymentMethod, PaymentMethodType } from "@/app/_prisma/browser";
import { useContext, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { toastHelper } from "@/app/_lib/constants/general";
import {
  createPaymentMethodAction,
  deletePaymentMethodAction,
  updatePaymentMethodAction
} from "@/app/_lib/serverActions/paymentMethod";
import { SetState } from "@/app/_lib/types/general";
import { CreatePaymentMethodModel } from "@/app/_lib/types/paymentMethod";
import CopyOrEditPaymentMethodDialog from "./CopyOrEditPaymentMethodDialog";
import RowActions from "../table/RowActions";
import ConfirmActionDialog from "../general/ConfirmActionDialog";
import { Button } from "@/app/_shadcn/components/ui/button";
import { Copy, Pencil, Trash2 } from "lucide-react";

const showSeparateActions = true;

interface ComponentProps {
  row: Row<PaymentMethod>;
}

export default function PaymentMethodRowActions({ row }: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [isOpen, setIsOpen] = useState(false);
  const [isCopy, setIsCopy] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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

    const model: CreatePaymentMethodModel = {
      type,
      name,
      accNum,
      note,
      showByDefault,
      field_1
    };

    setIsLoading(true);
    const res = isCopy
      ? await createPaymentMethodAction(model)
      : await updatePaymentMethodAction(row.original.id, model);
    setIsLoading(false);

    if (res.ok) {
      toastHelper.success(dict);
      setIsOpen(false);
    } else toastHelper.error(dict);
  }

  async function deleteRow() {
    const res = await deletePaymentMethodAction(row.original.id);

    if (res.ok) toastHelper.success(dict);
    else toastHelper.error(dict);
    setIsDeleteOpen(false);
  }

  function openDialog(isCopy: boolean) {
    setTimeout(() => {
      setIsCopy(isCopy);
      setIsOpen(true);
    }, 0);
  }

  return (
    <>
      {showSeparateActions && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            title={dict.labels.edit}
            onClick={() => openDialog(false)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={dict.labels.copy}
            onClick={() => openDialog(true)}
          >
            <Copy />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            title={dict.labels.delete}
            onClick={() => setTimeout(() => setIsDeleteOpen(true), 0)}
          >
            <Trash2 />
          </Button>
        </div>
      )}
      {!showSeparateActions && (
        <RowActions>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openDialog(false)}>
              {dict.labels.edit}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialog(true)}>
              {dict.labels.copy}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setTimeout(() => setIsDeleteOpen(true), 0)}
            >
              {dict.labels.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </RowActions>
      )}
      <CopyOrEditPaymentMethodDialog
        showShowByDefaultCheckbox
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isCopy={isCopy}
        paymentMethod={row.original}
        save={save}
      />
      <ConfirmActionDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        description={dict.labels.permanentlyDelete}
        confirmText={dict.labels.delete}
        onConfirm={deleteRow}
      />
    </>
  );
}
