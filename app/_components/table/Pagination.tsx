"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import DropdownInput from "../input/DropdownInput";

interface ComponentProps<TData> {
  table: Table<TData>;
}

export default function Pagination<TData>({ table }: ComponentProps<TData>) {
  const { dict } = useContext(LocaleContext);

  return (
    <div className="flex items-center justify-between">
      <div className="text-xs text-secondary-foreground">
        {dict.texts.rowSelected(
          table.getFilteredSelectedRowModel().rows.length,
          table.getFilteredRowModel().rows.length
        )}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div>
          <DropdownInput
            selected={table.getState().pagination.pageSize}
            options={[5, 10, 25, 50, 100]}
            renderSelected={(option) => `${option} ${dict.labels.rowsPerPage}`}
            onChange={(option) => option && table.setPageSize(option)}
          />
        </div>

        <div className="text-xs text-secondary-foreground">
          {dict.texts.pageSelected(
            table.getState().pagination.pageIndex + 1,
            table.getPageCount()
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="icon"
            className="hidden lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className=""
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className=""
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="hidden lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
