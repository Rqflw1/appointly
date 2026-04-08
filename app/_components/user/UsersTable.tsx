"use client";

import { useContext, useMemo, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
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
import { UserWithRole } from "@/app/_lib/types/user";
import ColumnHeader from "../table/ColumnHeader";
import SelectAllHeader from "../table/SelectAllHeader";
import SelectRowCell from "../table/SelectRowCell";
import UserRowActions from "./UserRowActions";
import Table from "../general/Table";
import { DEFAULT_PAGINATION_STATE } from "@/app/_lib/constants/general";
import Pagination from "../table/Pagination";
import TableSearchInput from "../input/TableSearchInput";
import { removeDiacritics } from "@/app/_lib/functions/general";
import { getFullName } from "@/app/_lib/functions/user";

const columnHelper = createColumnHelper<UserWithRole>();

interface ComponentProps {
  users: UserWithRole[];
}

export default function UsersTable({ users }: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>(
    structuredClone(DEFAULT_PAGINATION_STATE)
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  function globalFilterFn(
    row: Row<UserWithRole>,
    columnId: string,
    filterValue: string
  ) {
    const search = removeDiacritics(String(filterValue)).toLowerCase();

    if (columnId === "fullName") {
      const fullName = getFullName(row.original);
      return removeDiacritics(fullName).toLowerCase().includes(search);
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
      columnHelper.accessor((row) => getFullName(row), {
        id: "fullName",
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.name} />
        ),
        cell: ({ row }) => (
          <div className="font-medium">{getFullName(row.original)}</div>
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
        cell: ({ row }) => <UserRowActions row={row} />,
        size: 56
      })
    ];
  }, [dict]);

  const table = useReactTable({
    data: users,
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
        {dict.labels.users}
      </div>
      <div className="mt-8">
        <TableSearchInput className="w-64" table={table} />
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
