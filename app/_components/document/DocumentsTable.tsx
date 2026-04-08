"use client";

import {
  ColumnFiltersState,
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
import { useContext, useEffect, useMemo, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import ColumnHeader from "../table/ColumnHeader";
import { Badge } from "@/app/_shadcn/components/ui/badge";
import DocumentRowActions from "./DocumentRowActions";
import { cn } from "@/app/_shadcn/lib/utils";
import Link from "next/link";
import { buttonVariants } from "@/app/_shadcn/components/ui/button";
import { Plus } from "lucide-react";
import Pagination from "../table/Pagination";
import classNames from "classnames";
import TypeStatusFilter from "./TypeStatusFilter";
import {
  formatDate,
  removeDiacritics,
  toFixed
} from "@/app/_lib/functions/general";
import DateFilter, {
  getDateRangeForPeriod,
  Period
} from "./DateFilter";
import { DateRangeSchema } from "@/app/_lib/validation/general";
import { DEFAULT_PAGINATION_STATE } from "@/app/_lib/constants/general";
import SelectAllHeader from "../table/SelectAllHeader";
import SelectRowCell from "../table/SelectRowCell";
import { DocumentsChart } from "./DocumentsChart";
import { DocumentWithPartners } from "@/app/_lib/types/document";
import Table from "../general/Table";
import TableSearchInput from "../input/TableSearchInput";
import { Switch } from "@/app/_shadcn/components/ui/switch";
import { Label } from "@/app/_shadcn/components/ui/label";
import { Company, DocumentStatus, DocumentType } from "@/app/_prisma/browser";
import { z } from "zod";
import { amountWithCurrency } from "@/app/_lib/functions/document";

const columnHelper = createColumnHelper<DocumentWithPartners>();

interface ComponentProps {
  company: Company;
  documents: DocumentWithPartners[];
  type?: DocumentType;
}

const LOCAL_STORAGE_KEY = "documentsTableFilters";

const filtersSchema = z
  .object({
    period: z.nativeEnum(Period),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    types: z.array(z.nativeEnum(DocumentType)),
    statuses: z.array(z.nativeEnum(DocumentStatus))
  })
  .superRefine((data, ctx) => {
    if (data.period !== Period.CUSTOM) return;
    if (!data.dateFrom || !data.dateTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom period requires dateFrom and dateTo."
      });
    }
  });

type StoredFilters = z.infer<typeof filtersSchema>;

export default function DocumentsTable({
  company,
  documents,
  type
}: ComponentProps) {
  const { dict, language } = useContext(LocaleContext);

  const [isOpen, setIsOpen] = useState(false);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>(
    structuredClone(DEFAULT_PAGINATION_STATE)
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [period, setPeriod] = useState<Period>(Period.THIS_MONTH);
  const [hasLoadedFilters, setHasLoadedFilters] = useState(false);
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(getInitialFilters());
  const [globalFilter, setGlobalFilter] = useState("");

  function getDefaultStoredFilters(): StoredFilters {
    return {
      period: Period.THIS_MONTH,
      dateFrom: undefined,
      dateTo: undefined,
      types: [],
      statuses: []
    };
  }

  function getInitialFilters() {
    return buildColumnFilters(getDefaultStoredFilters());
  }

  function buildColumnFilters(filters: StoredFilters): ColumnFiltersState {
    const columnFilters: ColumnFiltersState = [];

    const dateRange =
      filters.period === Period.CUSTOM
        ? { from: filters.dateFrom, to: filters.dateTo }
        : getDateRangeForPeriod(filters.period);
    columnFilters.push({ id: "docDate", value: dateRange });

    if (type) columnFilters.push({ id: "type", value: [type] });
    else if (filters.types.length)
      columnFilters.push({ id: "type", value: filters.types });

    if (filters.statuses.length)
      columnFilters.push({ id: "status", value: filters.statuses });

    return columnFilters;
  }

  function persistFilters(filters: StoredFilters) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filters));
  }

  function loadFiltersFromStorage(): StoredFilters {
    const defaults = getDefaultStoredFilters();

    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      persistFilters(defaults);
      return defaults;
    }

    try {
      const parsed = JSON.parse(raw);
      const result = filtersSchema.safeParse(parsed);
      if (!result.success) {
        persistFilters(defaults);
        return defaults;
      }
      return result.data;
    } catch {
      persistFilters(defaults);
      return defaults;
    }
  }

  useEffect(() => {
    const stored = loadFiltersFromStorage();
    setPeriod(stored.period);
    setColumnFilters(buildColumnFilters(stored));
    setHasLoadedFilters(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedFilters) return;
    const dateRange = DateRangeSchema.safeParse(
      columnFilters.find((filter) => filter.id === "docDate")?.value
    ).data;
    const types =
      z.array(z.nativeEnum(DocumentType)).safeParse(
        columnFilters.find((filter) => filter.id === "type")?.value
      ).data ?? [];
    const statuses =
      z.array(z.nativeEnum(DocumentStatus)).safeParse(
        columnFilters.find((filter) => filter.id === "status")?.value
      ).data ?? [];

    const nextFilters: StoredFilters = {
      period,
      dateFrom: period === Period.CUSTOM ? dateRange?.from : undefined,
      dateTo: period === Period.CUSTOM ? dateRange?.to : undefined,
      types,
      statuses
    };

    persistFilters(nextFilters);
  }, [columnFilters, period, hasLoadedFilters]);

  function globalFilterFn(
    row: Row<DocumentWithPartners>,
    columnId: string,
    filterValue: string
  ) {
    const search = removeDiacritics(String(filterValue)).toLowerCase();

    if (columnId === "docNum")
      return removeDiacritics(row.original.docNum)
        .toLowerCase()
        .includes(search);
    if (columnId === "recipient")
      return (
        removeDiacritics(row.original.recipient.name)
          .toLowerCase()
          .includes(search) ||
        removeDiacritics(row.original.recipient.regNum)
          .toLowerCase()
          .includes(search)
      );
    return false;
  }

  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: "select",
        header: ({ table }) => <SelectAllHeader table={table} />,
        cell: ({ row }) => <SelectRowCell row={row} />,
        size: 40
      }),
      columnHelper.accessor("docNum", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.id} />
        ),
        cell: ({ row }) => {
          return (
            <Link href={`/documents/edit/${row.original.id}`}>
              {row.original.docNum}
            </Link>
          );
        }
      }),
      columnHelper.accessor("type", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.type} />
        ),
        cell: ({ row }) => dict.documentType[row.original.type],
        filterFn: "arrIncludesSome"
      }),
      columnHelper.accessor((row) => row.recipient.name, {
        id: "recipient",
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.recipient} />
        ),
        cell: ({ row }) => {
          const name = row.original.recipient.name;
          const regNum = row.original.recipient.regNum;

          if (!name && !regNum)
            return (
              <div className="text-secondary-foreground">
                {dict.labels.noRecipient}
              </div>
            );

          return (
            <div className="max-w-96 text-wrap">
              <div className="font-medium">{name}</div>
              <div className="text-2xs text-secondary-foreground">{regNum}</div>
            </div>
          );
        }
      }),
      columnHelper.accessor("status", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.status} />
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              variant="destructive"
              className={classNames({
                "bg-neutral-400": status === DocumentStatus.DRAFT,
                "bg-green-300": status === DocumentStatus.READY,
                "bg-blue-400": status === DocumentStatus.SENT,
                "bg-green-700": status === DocumentStatus.READY
              })}
            >
              {dict.documentStatus[status]}
            </Badge>
          );
        },
        filterFn: "arrIncludesSome"
      }),
      columnHelper.accessor("docDate", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.date} />
        ),
        cell: ({ row }) => {
          return (
            <div>
              <div>{formatDate(row.original.docDate, language)}</div>
              <div className="text-2xs text-secondary-foreground">
                {`${dict.labels.dueDate}: ${formatDate(
                  row.original.dueDate,
                  language
                )}`}
              </div>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const range = DateRangeSchema.safeParse(filterValue).data;
          if (!range) return true;
          if (!range.from) return true;
          if (!range.to) return true;

          return (
            row.original.docDate.getTime() >= range.from.getTime() &&
            row.original.docDate.getTime() <= range.to.getTime()
          );
        }
      }),
      columnHelper.accessor("grossTotal", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.total} />
        ),
        cell: ({ row }) => {
          return (
            <div>
                <div className="flex items-end gap-1">
                  <div className="text-sm text-accent-foreground font-medium">
                    {amountWithCurrency(
                      toFixed(row.original.grossTotal, 2),
                      row.original.currency
                    )}
                  </div>
                  {row.original.currencyRate !== 0 && (
                    <div className="pb-0.5 text-2xs text-secondary-foreground">
                    {amountWithCurrency(
                      toFixed(
                        row.original.grossTotal * row.original.currencyRate,
                        2
                      ),
                      company.currency
                    )}
                  </div>
                )}
              </div>
              <div className="text-2xs text-secondary-foreground">
                {`${dict.labels.withoutVat} ${amountWithCurrency(
                  toFixed(row.original.netTotal, 2),
                  row.original.currency
                )}`}
              </div>
            </div>
          );
        }
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => <DocumentRowActions row={row} company={company} />,
        size: 56
      })
    ];
  }, [dict, language, company]);

  const table = useReactTable({
    data: documents,
    columns,
    state: {
      rowSelection,
      pagination,
      sorting,
      columnFilters,
      globalFilter
    },
    //
    globalFilterFn,
    //
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    //
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  return (
    <div>
      {isOpen && (
        <div className="mb-8">
          <DocumentsChart
            company={company}
            table={table}
            documents={documents}
          />
        </div>
      )}
      <div className="p-8 bg-secondary rounded-3xl">
        <div className="flex gap-4">
          <div className="text-xl font-semibold text-foreground">
            {!type && dict.labels.all}
            {type && dict.documentTypePlural[type]}
          </div>
          <div className="flex items-center">
            <Switch
              id="analytics"
              checked={isOpen}
              onCheckedChange={(value) => setIsOpen(value)}
            />
            <Label htmlFor="analytics" className="ml-2">
              {dict.labels.analytics}
            </Label>
          </div>
        </div>
        <div className="mt-8 flex items-center gap-2">
          <DateFilter
            table={table}
            period={period}
            onPeriodChange={setPeriod}
          />
          <TypeStatusFilter table={table} hasType={!!type} />
          <TableSearchInput className="w-64" table={table} />
          <Link
            href="/documents/new"
            className={cn(buttonVariants({ className: "ml-auto pl-3 pr-5" }))}
          >
            <Plus />
            <span>{dict.labels.newDocument}</span>
          </Link>
        </div>
        <div className="mt-6">
          <Table table={table} columns={columns} />
        </div>
        <div className="mt-6">
          <Pagination table={table} />
        </div>
      </div>
    </div>
  );
}
