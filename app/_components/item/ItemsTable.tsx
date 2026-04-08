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
import { Company, Item, Unit } from "@/app/_prisma/browser";
import NewItemDialog from "./NewItemDialog";
import { removeDiacritics, round, toFixed } from "@/app/_lib/functions/general";
import { amountWithCurrency } from "@/app/_lib/functions/document";
import ItemRowActions from "./ItemRowActions";
import Pagination from "../table/Pagination";
import { DEFAULT_PAGINATION_STATE } from "@/app/_lib/constants/general";
import Table from "../general/Table";
import TableSearchInput from "../input/TableSearchInput";
import { Button } from "@/app/_shadcn/components/ui/button";
import { toastHelper } from "@/app/_lib/constants/general";
import { createItemsAction } from "@/app/_lib/serverActions/item";
import { CreateItemsModelSchema } from "@/app/_lib/validation/item";

const columnHelper = createColumnHelper<Item>();

interface ComponentProps {
  company: Company;
  items: Item[];
  units: Unit[];
}

export default function ItemsTable({ company, items, units }: ComponentProps) {
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

  function globalFilterFn(
    row: Row<Item>,
    columnId: string,
    filterValue: string
  ) {
    const search = removeDiacritics(String(filterValue)).toLowerCase();

    if (columnId === "sku")
      return removeDiacritics(row.original.sku).toLowerCase().includes(search);
    if (columnId === "name")
      return removeDiacritics(row.original.name).toLowerCase().includes(search);
    return false;
  }

  async function exportRecords(ids?: string[]) {
    setIsExporting(true);
    const res = await fetch("/api/items/export", {
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
      link.download = "items.json";
      link.click();
      URL.revokeObjectURL(url);
    } else toastHelper.error(dict);
  }

  async function onImportFileChange(e: ChangeEvent<HTMLInputElement>) {
    try {
      const file = e.target.files?.item(0);
      if (!file) return;

      const parsed = JSON.parse(await file.text());

      const zRes = CreateItemsModelSchema.safeParse(parsed);
      if (!zRes.success) {
        toastHelper.error(dict);
        return;
      }

      setIsImporting(true);
      const res = await createItemsAction(zRes.data);
      setIsImporting(false);

      if (res.ok) toastHelper.success(dict);
      else toastHelper.error(dict);
    } catch {
      toastHelper.error(dict);
    }
  }

  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: "select",
        header: ({ table }) => <SelectAllHeader table={table} />,
        cell: ({ row }) => <SelectRowCell row={row} />,
        size: 56
      }),
      columnHelper.accessor("sku", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.sku} />
        ),
        cell: ({ row }) => <div>{row.original.sku}</div>
      }),
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.itemName} />
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-secondary-foreground text-2xs">
              {row.original.description}
            </div>
          </div>
        )
      }),
      columnHelper.accessor("netPrice", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.priceWithoutVat} />
        ),
        cell: ({ row }) => {
          const discountRate = row.original.discountRate || 0;

          return (
            <div>
              <div>
                {amountWithCurrency(
                  toFixed(row.original.netPrice, 4),
                  row.original.currency
                )}
              </div>
              {discountRate !== 0 && (
                <div className="text-secondary-foreground text-2xs">
                  {`${dict.labels.discountRate} ${round(
                    discountRate * 100,
                    2
                  )} %`}
                </div>
              )}
            </div>
          );
        }
      }),
      columnHelper.accessor("vatRate", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.vatRate} />
        ),
        cell: ({ row }) => {
          const vatRate = row.original.vatRate ?? NaN;
          return (
            <div>
              {isNaN(vatRate) && dict.labels.none}
              {!isNaN(vatRate) && `${round(vatRate * 100, 2)} %`}
            </div>
          );
        }
      }),
      columnHelper.accessor("grossPrice", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.price} />
        ),
        cell: ({ row }) => {
          return (
            <div>
              {amountWithCurrency(
                toFixed(row.original.grossPrice, 2),
                row.original.currency
              )}
            </div>
          );
        }
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => <ItemRowActions row={row} units={units} />,
        size: 56
      })
    ];
  }, [dict]);

  const table = useReactTable({
    data: items,
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
        {dict.labels.items}
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
        <NewItemDialog company={company} units={units} />
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
