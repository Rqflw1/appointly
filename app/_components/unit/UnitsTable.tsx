"use client";

import { useContext, useMemo, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  Row,
  RowSelectionState,
  useReactTable
} from "@tanstack/react-table";
import ColumnHeader from "../table/ColumnHeader";
import SelectAllHeader from "../table/SelectAllHeader";
import SelectRowCell from "../table/SelectRowCell";
import { Unit } from "@/app/_prisma/browser";
import Table from "../general/Table";
import TableSearchInput from "../input/TableSearchInput";
import { removeDiacritics } from "@/app/_lib/functions/general";
import NewUnitDialog from "./NewUnitDialog";
import UnitRowActions from "./UnitRowActions";

const columnHelper = createColumnHelper<Unit>();

interface ComponentProps {
  units: Unit[];
}

export default function UnitsTable({ units }: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  function globalFilterFn(
    row: Row<Unit>,
    columnId: string,
    filterValue: string
  ) {
    const search = removeDiacritics(String(filterValue)).toLowerCase();

    if (columnId === "name")
      return removeDiacritics(row.original.name).toLowerCase().includes(search);
    if (columnId === "description")
      return removeDiacritics(row.original.description)
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
          <ColumnHeader column={column} title={dict.labels.itemName} />
        ),
        cell: ({ row }) => <div>{row.original.name}</div>
      }),
      columnHelper.accessor("description", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.description} />
        ),
        cell: ({ row }) => <div>{row.original.description}</div>
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => <UnitRowActions row={row} />,
        size: 56
      })
    ];
  }, [dict]);

  const table = useReactTable({
    data: units,
    columns,
    state: {
      rowSelection,
      globalFilter
    },
    enableSorting: false,
    //
    globalFilterFn,
    //
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    //
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  return (
    <div className="p-8 bg-secondary rounded-3xl">
      <div className="text-xl font-semibold text-foreground">
        {dict.labels.unit}
      </div>
      <div className="mt-8 flex justify-between gap-2">
        <TableSearchInput className="w-64" table={table} />
        <NewUnitDialog />
      </div>
      <div className="mt-6">
        <Table table={table} columns={columns} />
      </div>
    </div>
  );
}
