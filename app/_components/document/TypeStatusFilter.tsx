import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuTrigger
} from "@/app/_shadcn/components/ui/dropdown-menu";
import { ChevronsUpDown } from "lucide-react";
import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { buttonVariants } from "@/app/_shadcn/components/ui/button";
import { Checkbox } from "@/app/_shadcn/components/ui/checkbox";
import { Table } from "@tanstack/react-table";
import { z } from "zod";
import { CheckedState } from "@radix-ui/react-checkbox";
import { cn } from "@/app/_shadcn/lib/utils";
import { DocumentWithPartners } from "@/app/_lib/types/document";
import { statuses, types } from "@/app/_lib/constants/general";
import { Label } from "@/app/_shadcn/components/ui/label";
import { DocumentStatus, DocumentType } from "@/app/_prisma/enums";

interface ComponentProps {
  table: Table<DocumentWithPartners>;
  hasType: boolean;
}

export default function TypeStatusFilter({ table, hasType }: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const typeColumn = table.getColumn("type");
  const selectedTypes =
    z.array(z.enum(DocumentType)).safeParse(typeColumn?.getFilterValue())
      .data ?? [];

  const statusColumn = table.getColumn("status");
  const selectedStatuses =
    z.array(z.enum(DocumentStatus)).safeParse(statusColumn?.getFilterValue())
      .data ?? [];

  function onTypeChange(type: DocumentType, value: CheckedState) {
    const newTypes = selectedTypes.filter((t) => t !== type);
    if (value === true) newTypes.push(type);
    typeColumn?.setFilterValue(newTypes);
  }

  function onStatusChange(status: DocumentStatus, value: CheckedState) {
    const newStatuses = selectedStatuses.filter((s) => s !== status);
    if (value === true) newStatuses.push(status);
    statusColumn?.setFilterValue(newStatuses);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "input" }))}>
        <div>{dict.labels.filters}</div>
        <ChevronsUpDown />
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent className="flex gap-4" align="start">
          <div className="w-48">
            <DropdownMenuLabel>{dict.labels.type}</DropdownMenuLabel>
            <DropdownMenuGroup>
              {types.map((type) => {
                const checked = selectedTypes.includes(type);
                return (
                  <DropdownMenuItem
                    disabled={hasType}
                    key={type}
                    onClick={(e) => {
                      e.preventDefault();
                      if (hasType) return;
                      onTypeChange(type, !checked);
                    }}
                  >
                    <Checkbox id={type} checked={checked} />
                    <Label>{dict.documentType[type]}</Label>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </div>
          <div className="w-48">
            <DropdownMenuLabel>{dict.labels.status}</DropdownMenuLabel>
            <DropdownMenuGroup>
              {statuses.map((status) => {
                const checked = selectedStatuses.includes(status);
                return (
                  <DropdownMenuItem
                    key={status}
                    onClick={(e) => {
                      e.preventDefault();
                      onStatusChange(status, !checked);
                    }}
                  >
                    <Checkbox
                      id={status}
                      checked={selectedStatuses.includes(status)}
                    />
                    <Label>{dict.documentStatus[status]}</Label>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </div>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
