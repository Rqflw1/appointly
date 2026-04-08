"use client";

import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";
import { DocumentEventWithUser } from "@/app/_lib/types/documentEvent";
import { formatDateTime } from "@/app/_lib/functions/general";
import { getFullName } from "@/app/_lib/functions/user";

interface ComponentProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  events: DocumentEventWithUser[];
}

export default function DocumentHistoryDialog({
  isOpen,
  setIsOpen,
  events
}: ComponentProps) {
  const { dict, language } = useContext(LocaleContext);

  return (
    <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.labels.history}</DialogTitle>
        </DialogHeader>
        <div className="p-6 bg-secondary rounded-3xl">
          <div className="flex flex-col gap-4">
            {events.map((event) => {
              const eventDate = new Date(event.createdAt);
              const userName = getFullName(event.user) || event.user.email;

              return (
                <div key={event.id} className="flex flex-col gap-1 text-sm">
                  <div>{`${dict.documentEventType[event.documentEventType]} ${formatDateTime(
                    eventDate,
                    language
                  )}`}</div>
                  <div className="text-secondary-foreground">
                    {userName}
                  </div>
                </div>
              );
            })}
            {!events.length && (
              <div className="text-sm text-secondary-foreground">
                {dict.labels.noResults}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
