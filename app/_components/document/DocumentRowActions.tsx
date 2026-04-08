"use client";

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/app/_shadcn/components/ui/dropdown-menu";
import { useContext, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { Row } from "@tanstack/react-table";
import {
  convertDocumentAction,
  deleteDocumentAction
} from "@/app/_lib/serverActions/document";
import Link from "next/link";
import { toastHelper, types } from "@/app/_lib/constants/general";
import { DocumentWithPartners } from "@/app/_lib/types/document";
import SendViaEmailDialog from "./SendViaEmailDialog";
import RowActions from "../table/RowActions";
import { DocumentType } from "@/app/_prisma/enums";
import { Company } from "@/app/_prisma/browser";
import { getDocumentFilename } from "@/app/_lib/functions/document";
import ConfirmActionDialog from "../general/ConfirmActionDialog";

interface ComponentProps {
  row: Row<DocumentWithPartners>;
  company: Company;
}

export default function DocumentRowActions({ row, company }: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  async function deleteRow() {
    const res = await deleteDocumentAction(row.original.id);

    if (res.ok) toastHelper.success(dict);
    else toastHelper.error(dict);
    setIsDeleteOpen(false);
  }

  async function convertDocument(type: DocumentType) {
    const res = await convertDocumentAction(row.original.id, type);

    if (res.ok) toastHelper.success(dict);
    else toastHelper.error(dict);
  }

  function exportXml() {
    const link = document.createElement("a");
    link.href = `/api/documents/${row.original.id}/peppol`;
    link.download = getDocumentFilename(row.original, "xml");
    link.target = "_blank";
    link.click();
  }

  function exportPdf(download: boolean, isHarbstone = false) {
    const link = document.createElement("a");
    link.href = `/api/documents/${row.original.id}/pdf`;
    if (isHarbstone) link.href = `${link.href}?isHarbstone=true`;
    link.target = "_blank";
    if (download) link.download = getDocumentFilename(row.original, "pdf");
    link.click();
  }

  return (
    <>
      <RowActions>
        <DropdownMenuContent align="end" className="">
          <DropdownMenuItem asChild>
            <Link href={`/documents/edit/${row.original.id}`}>
              {dict.labels.edit}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/documents/copy/${row.original.id}`}>
              {dict.labels.copy}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportXml}>
            {dict.labels.exportXml}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportPdf(true)}>
            {dict.labels.download}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportPdf(false)}>
            {dict.labels.print}
          </DropdownMenuItem>
          {/* <DropdownMenuItem onClick={() => exportPdf(true, true)}>
            {dict.labels.download} Harbstone
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportPdf(false, true)}>
            {dict.labels.print} Harbstone
          </DropdownMenuItem> */}
          <DropdownMenuItem
            onClick={() => setTimeout(() => setIsOpen(true), 0)}
          >
            {dict.labels.sendViaEmail}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {dict.labels.convertTo}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {types.map((type, key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => convertDocument(type)}
                >
                  {dict.documentType[type]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setTimeout(() => setIsDeleteOpen(true), 0)}
          >
            {dict.labels.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </RowActions>
      <SendViaEmailDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        document={row.original}
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
