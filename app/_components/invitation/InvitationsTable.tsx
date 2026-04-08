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
import Table from "../general/Table";
import TableSearchInput from "../input/TableSearchInput";
import { removeDiacritics } from "@/app/_lib/functions/general";
import NewInvitationDialog from "./NewInvitaionDialog";
import { Invitation } from "@/app/_prisma/browser";
import InvitaitionRowActions from "./InvitaitionRowActions";

const columnHelper = createColumnHelper<Invitation>();

interface ComponentProps {
  invitations: Invitation[];
}

export default function InvitationsTable({ invitations }: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  function globalFilterFn(
    row: Row<Invitation>,
    columnId: string,
    filterValue: string
  ) {
    const search = removeDiacritics(String(filterValue)).toLowerCase();

    if (columnId === "email") {
      return removeDiacritics(row.original.email)
        .toLowerCase()
        .includes(search);
    }
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
      columnHelper.accessor("email", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.email} />
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.email}</div>
        )
      }),
      columnHelper.accessor("role", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.role} />
        ),
        cell: ({ row }) => <div>{dict.userAccessLevel[row.original.role]}</div>
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => <InvitaitionRowActions row={row} />,
        size: 56
      })
    ];
  }, [dict]);

  const table = useReactTable({
    data: invitations,
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
        {dict.labels.invitations}
      </div>
      <div className="mt-8 flex justify-between gap-2">
        <TableSearchInput className="w-64" table={table} />
        <div>
          <NewInvitationDialog />
        </div>
      </div>
      <div className="mt-6">
        <Table table={table} columns={columns} />
      </div>
    </div>
  );
}
