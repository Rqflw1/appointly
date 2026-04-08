"use client";

import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  useReactTable
} from "@tanstack/react-table";
import { useContext, useMemo, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import ColumnHeader from "../table/ColumnHeader";
import Pagination from "../table/Pagination";
import SelectAllHeader from "../table/SelectAllHeader";
import SelectRowCell from "../table/SelectRowCell";
import { CompanyWithRole } from "@/app/_lib/types/company";
import CompanyRowActions from "./CompanyRowActions";
import { DEFAULT_PAGINATION_STATE } from "@/app/_lib/constants/general";
import NewCompanyDialog from "./NewCompanyDialog";
import Table from "../general/Table";
import TableSearchInput from "../input/TableSearchInput";
import { removeDiacritics } from "@/app/_lib/functions/general";

const columnHelper = createColumnHelper<CompanyWithRole>();

interface ComponentProps {
  companies: CompanyWithRole[];
  addDialogIsOpen: string;
}

export default function CompaniesTable({
  companies,
  addDialogIsOpen
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>(
    structuredClone(DEFAULT_PAGINATION_STATE)
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  function globalFilterFn(
    row: Row<CompanyWithRole>,
    columnId: string,
    filterValue: string
  ) {
    const search = removeDiacritics(String(filterValue)).toLowerCase();

    if (columnId === "name")
      return removeDiacritics(row.original.name).toLowerCase().includes(search);
    if (columnId === "regNum")
      return removeDiacritics(row.original.regNum)
        .toLowerCase()
        .includes(search);
    return false;
  }

  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: "select",
        header: ({ table }) => <SelectAllHeader table={table} />,
        cell: ({ row }) => <SelectRowCell row={row} />,
        size: 56
      }),
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <ColumnHeader
            column={column}
            title={`${dict.labels.itemName}/${dict.labels.name}`}
          />
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        )
      }),
      columnHelper.accessor("regNum", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.regNumber} />
        ),
        cell: ({ row }) => <div>{row.original.regNum}</div>
      }),
      columnHelper.accessor("role", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.role} />
        ),
        cell: ({ row }) => <div>{row.original.role}</div>
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => <CompanyRowActions row={row} />,
        size: 56
      })
    ];
  }, [dict]);

  const table = useReactTable({
    data: companies,
    columns,
    state: {
      rowSelection,
      pagination,
      sorting,
      globalFilter
    },
    //
    globalFilterFn,
    //
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    //
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  return (
    <div className="p-8 bg-secondary rounded-3xl">
      <div className="text-xl font-semibold text-foreground">
        {dict.labels.companies}
      </div>
      <div className="mt-8 flex justify-between gap-2">
        <TableSearchInput className="w-64" table={table} />
        <NewCompanyDialog isOpen={addDialogIsOpen === "true"} />
      </div>
      <div className="mt-6">
        <Table table={table} columns={columns} />
      </div>
      <div className="mt-6">
        <Pagination table={table} />
      </div>
    </div>
  );
}
