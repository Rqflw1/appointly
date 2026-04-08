"use client";

import { useContext, useMemo, useRef, useState, type ChangeEvent } from "react";
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
import ColumnHeader from "../table/ColumnHeader";
import SelectAllHeader from "../table/SelectAllHeader";
import SelectRowCell from "../table/SelectRowCell";
import Pagination from "../table/Pagination";
import {
  DEFAULT_PAGINATION_STATE,
  toastHelper
} from "@/app/_lib/constants/general";
import PartnerRowActions from "./PartnerRowActions";
import NewPartnerDialog from "./NewPartnerDialog";
import { Company } from "@/app/_prisma/browser";
import Table from "../general/Table";
import { removeDiacritics } from "@/app/_lib/functions/general";
import TableSearchInput from "../input/TableSearchInput";
import { Button } from "@/app/_shadcn/components/ui/button";
import { createPartnersAction } from "@/app/_lib/serverActions/company";
import { CreatePartnersModelSchema } from "@/app/_lib/validation/partner";

const columnHelper = createColumnHelper<Company>();

interface ComponentProps {
  partners: Company[];
}

export default function PartnersTable({ partners }: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>(
    structuredClone(DEFAULT_PAGINATION_STATE)
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  async function exportRecords(ids?: string[]) {
    setIsExporting(true);
    const res = await fetch("/api/partners/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids })
    });
    setIsExporting(false);

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "partners.json";
      link.click();
      URL.revokeObjectURL(url);
    } else toastHelper.error(dict);
  }

  async function onImportFileChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    try {
      const file = input.files?.item(0);
      if (!file) return;

      const parsed = JSON.parse(await file.text());

      const zRes = CreatePartnersModelSchema.safeParse(parsed);
      if (!zRes.success) {
        toastHelper.error(dict);
        return;
      }

      setIsImporting(true);
      try {
        const res = await createPartnersAction(zRes.data);
        if (res.ok) toastHelper.success(dict);
        else toastHelper.error(dict);
      } finally {
        setIsImporting(false);
      }
    } catch {
      toastHelper.error(dict);
    } finally {
      input.value = "";
    }
  }

  function globalFilterFn(
    row: Row<Company>,
    columnId: string,
    filterValue: string
  ) {
    const search = removeDiacritics(String(filterValue)).toLowerCase();

    if (columnId === "name")
      return (
        removeDiacritics(row.original.name).toLowerCase().includes(search) ||
        removeDiacritics(row.original.regNum).toLowerCase().includes(search)
      );
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
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-secondary-foreground text-2xs">
              {row.original.regNum}
            </div>
          </div>
        )
      }),
      columnHelper.accessor("address", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.address} />
        ),
        cell: ({ row }) => <div>{row.original.address}</div>
      }),
      columnHelper.accessor("email", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.email} />
        ),
        cell: ({ row }) => <div>{row.original.email}</div>
      }),
      columnHelper.accessor("phone", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.phone} />
        ),
        cell: ({ row }) => <div>{row.original.phone}</div>
      }),
      columnHelper.accessor("comment", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.comment} />
        ),
        cell: ({ row }) => {
          return <div>{row.original.comment}</div>;
        },
        enableSorting: false
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => <PartnerRowActions row={row} />,
        size: 56
      })
    ];
  }, [dict]);

  const table = useReactTable({
    data: partners,
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
        {dict.labels.partners}
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        <TableSearchInput className="w-64" table={table} />
        <Button
          type="button"
          variant="tertiary"
          className="ml-auto"
          disabled={isExporting || isImporting}
          isLoading={isExporting}
          onClick={() => exportRecords()}
        >
          {dict.labels.exportAll}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={onImportFileChange}
        />
        <Button
          type="button"
          variant="tertiary"
          disabled={isExporting || isImporting}
          isLoading={isImporting}
          onClick={() => fileInputRef.current?.click()}
        >
          {dict.labels.import}
        </Button>
        <NewPartnerDialog />
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
