"use client";

import { useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";
import { Button } from "@/app/_shadcn/components/ui/button";
import { LocaleContext } from "../context/LocaleProvider";

interface ComponentProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
  confirmText: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export default function ConfirmActionDialog({
  isOpen,
  onOpenChange,
  description,
  confirmText,
  onConfirm,
  isLoading
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.labels.confirmAction}</DialogTitle>
        </DialogHeader>
        <div>{description}</div>
        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            disabled={isLoading}
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
