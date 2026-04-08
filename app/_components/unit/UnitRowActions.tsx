"use client";

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/app/_shadcn/components/ui/dropdown-menu";
import { Row } from "@tanstack/react-table";
import { Unit } from "@/app/_prisma/browser";
import { useContext, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { toastHelper } from "@/app/_lib/constants/general";
import RowActions from "../table/RowActions";
import { deleteUnitAction } from "@/app/_lib/serverActions/unit";
import CopyOrEditUnitDialog from "./CopyOrEditUnitDialog";
import ConfirmActionDialog from "../general/ConfirmActionDialog";
import { Button } from "@/app/_shadcn/components/ui/button";
import { Copy, Pencil, Trash2 } from "lucide-react";

const showSeparateActions = true;

interface ComponentProps {
  row: Row<Unit>;
}

export default function UnitRowActions({ row }: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [isOpen, setIsOpen] = useState(false);
  const [isCopy, setIsCopy] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  async function deleteRow() {
    const res = await deleteUnitAction(row.original.id);

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
      <CopyOrEditUnitDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isCopy={isCopy}
        unit={row.original}
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
