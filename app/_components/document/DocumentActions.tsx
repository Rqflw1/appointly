"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import {
  Copy,
  Download,
  FileCodeCorner,
  History,
  Mail,
  Printer,
  Save,
  Trash2
} from "lucide-react";
import { DocumentWithChildren } from "@/app/_lib/types/document";
import { getDocumentFilename } from "@/app/_lib/functions/document";
import { SetState } from "@/app/_lib/types/general";

interface ComponentProps {
  isLoading: boolean;
  documentObject?: DocumentWithChildren;
  saveRecord: () => void;
  setIsSendEmailOpen: SetState<boolean>;
  setIsHistoryOpen: SetState<boolean>;
  setIsDeleteOpen: SetState<boolean>;
}

export default function DocumentActions({
  isLoading,
  documentObject,
  saveRecord,
  setIsSendEmailOpen,
  setIsHistoryOpen,
  setIsDeleteOpen
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  function exportXml() {
    if (!documentObject) return;
    const link = document.createElement("a");
    link.href = `/api/documents/${documentObject.id}/peppol`;
    link.download = getDocumentFilename(documentObject, "xml");
    link.target = "_blank";
    link.click();
  }

  function exportPdf(download: boolean, isHarbstone = false) {
    if (!documentObject) return;
    const link = document.createElement("a");
    link.href = `/api/documents/${documentObject.id}/pdf`;
    if (isHarbstone) link.href = `${link.href}?isHarbstone=true`;
    link.target = "_blank";
    if (download) link.download = getDocumentFilename(documentObject, "pdf");
    link.click();
  }

  return (
    <div className="flex gap-2">
      <Button
        isLoading={isLoading}
        disabled={isLoading}
        variant="default"
        size="icon"
        title={dict.labels.save}
        onClick={saveRecord}
      >
        <Save />
      </Button>
      {documentObject && (
        <>
          <Button
            variant="secondary"
            size="icon"
            title={dict.labels.copy}
            onClick={() =>
              window.open(
                `/documents/copy/${documentObject.id}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            <Copy />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            title={dict.labels.exportXml}
            onClick={exportXml}
          >
            <FileCodeCorner />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            title={dict.labels.download}
            onClick={() => exportPdf(true)}
          >
            <Download />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            title={dict.labels.print}
            onClick={() => exportPdf(false)}
          >
            <Printer />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            title={dict.labels.sendViaEmail}
            onClick={() => setIsSendEmailOpen(true)}
          >
            <Mail />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            title={dict.labels.history}
            onClick={() => setIsHistoryOpen(true)}
          >
            <History />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            title={dict.labels.delete}
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 />
          </Button>
        </>
      )}
    </div>
  );
}
