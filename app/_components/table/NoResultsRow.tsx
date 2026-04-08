"use client";

import { TableCell, TableRow } from "@/app/_shadcn/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";
import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";

interface ComponentProps<TData> {
  columns: ColumnDef<TData, any>[];
}

export default function NoResultsRow<TData>({
  columns
}: ComponentProps<TData>) {
  const { dict } = useContext(LocaleContext);

  return (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-24 text-center">
        {dict.labels.noResults}
      </TableCell>
    </TableRow>
  );
}
