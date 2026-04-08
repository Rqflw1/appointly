"use client";

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/app/_shadcn/components/ui/dropdown-menu";
import { Row } from "@tanstack/react-table";
import { useContext, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { toastHelper } from "@/app/_lib/constants/general";
import { Company } from "@/app/_prisma/browser";
import { deleteCompanyAction } from "@/app/_lib/serverActions/company";
import CopyOrEditPartnerDialog from "./CopyOrEditPartnerDialog";
import Link from "next/link";
import RowActions from "../table/RowActions";
import ConfirmActionDialog from "../general/ConfirmActionDialog";

interface ComponentProps {
  row: Row<Company>;
}

export default function PartnerRowActions({ row }: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [isOpen, setIsOpen] = useState(false);
  const [isCopy, setIsCopy] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  async function deleteRow() {
    const res = await deleteCompanyAction(row.original.id);

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
      <RowActions>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openDialog(false)}>
            {dict.labels.edit}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog(true)}>
            {dict.labels.copy}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/documents/new?partnerId=${row.original.id}`}>
              {dict.labels.newDocument}
            </Link>
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
      <CopyOrEditPartnerDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isCopy={isCopy}
        partnerId={row.original.id}
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
