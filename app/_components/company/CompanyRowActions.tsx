"use client";

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/app/_shadcn/components/ui/dropdown-menu";
import { Row } from "@tanstack/react-table";
import { CompanyWithRole } from "@/app/_lib/types/company";
import { useContext, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useRouter } from "next/navigation";
import {
  deleteCompanyAction,
  selectComapnyAction
} from "@/app/_lib/serverActions/company";
import { toastHelper } from "@/app/_lib/constants/general";
import RowActions from "../table/RowActions";
import ConfirmActionDialog from "../general/ConfirmActionDialog";
import { Button } from "@/app/_shadcn/components/ui/button";
import { Check, Trash2 } from "lucide-react";

const showSeparateActions = true;

interface ComponentProps {
  row: Row<CompanyWithRole>;
}

export default function CompanyRowActions({ row }: ComponentProps) {
  const { dict } = useContext(LocaleContext);
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  async function deleteRow() {
    const res = await deleteCompanyAction(row.original.id);

    if (res.ok) toastHelper.success(dict);
    else toastHelper.error(dict);
    setIsDeleteOpen(false);
  }

  async function switchCompany() {
    await selectComapnyAction(row.original.id);
    router.push("/documents");
  }

  return (
    <>
      {showSeparateActions && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            title={dict.labels.select}
            onClick={() => switchCompany()}
          >
            <Check />
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
            <DropdownMenuItem onClick={() => switchCompany()}>
              {dict.labels.select}
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
