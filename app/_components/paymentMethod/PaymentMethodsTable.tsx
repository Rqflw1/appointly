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
import { PaymentMethod, PaymentMethodType } from "@/app/_prisma/browser";
import PaymentMethodRowActions from "./PaymentMethodRowActions";
import Table from "../general/Table";
import { toastHelper } from "@/app/_lib/constants/general";
import TableSearchInput from "../input/TableSearchInput";
import { removeDiacritics } from "@/app/_lib/functions/general";
import NewPaymentMethodDialog from "./NewPaymentMethodDialog";
import { SetState } from "@/app/_lib/types/general";
import { CreatePaymentMethodModel } from "@/app/_lib/types/paymentMethod";
import { createPaymentMethodAction } from "@/app/_lib/serverActions/paymentMethod";

const columnHelper = createColumnHelper<PaymentMethod>();

interface ComponentProps {
  paymentMethods: PaymentMethod[];
}

export default function PaymentMethodsTable({
  paymentMethods
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  async function save(
    typeInput: [PaymentMethodType, SetState<PaymentMethodType>],
    nameInput: [string, SetState<string>, string, SetState<string>],
    accNumInput: [string, SetState<string>, string, SetState<string>],
    noteInput: [string, SetState<string>],
    showByDefaultInput: [boolean, SetState<boolean>],
    field_1Input: [string, SetState<string>],
    setIsLoading: SetState<boolean>,
    setIsOpen: SetState<boolean>
  ) {
    const [type] = typeInput;
    const [name, , , setNameError] = nameInput;
    const [accNum, , , setAccNumError] = accNumInput;
    const [note] = noteInput;
    const [showByDefault] = showByDefaultInput;
    const [field_1] = field_1Input;

    if (!name) setNameError(dict.errors.nameIsRequired);
    if (!accNum) setAccNumError(dict.errors.nameIsRequired);

    if (!name) return;
    if (!accNum) return;

    const model: CreatePaymentMethodModel = {
      type,
      name,
      accNum,
      note,
      showByDefault,
      field_1
    };

    setIsLoading(true);
    const res = await createPaymentMethodAction(model);
    setIsLoading(false);

    if (res.ok) {
      toastHelper.success(dict);
      setIsOpen(false);
    } else toastHelper.error(dict);
  }

  function globalFilterFn(
    row: Row<PaymentMethod>,
    columnId: string,
    filterValue: string
  ) {
    const search = removeDiacritics(String(filterValue)).toLowerCase();

    if (columnId === "type")
      return removeDiacritics(dict.paymentMethodType[row.original.type])
        .toLowerCase()
        .includes(search);
    if (columnId === "name")
      return removeDiacritics(row.original.name).toLowerCase().includes(search);
    if (columnId === "accNum")
      return removeDiacritics(row.original.accNum)
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
      columnHelper.accessor("type", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.type} />
        ),
        cell: ({ row }) => (
          <div>{dict.paymentMethodType[row.original.type]}</div>
        )
      }),
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.itemName} />
        ),
        cell: ({ row }) => <div>{row.original.name}</div>
      }),
      columnHelper.accessor("accNum", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.accNumOrId} />
        ),
        cell: ({ row }) => <div>{row.original.accNum}</div>
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => <PaymentMethodRowActions row={row} />,
        size: 56
      })
    ];
  }, [dict]);

  const table = useReactTable({
    data: paymentMethods,
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
        {dict.labels.paymentMethods}
      </div>
      <div className="mt-8 flex justify-between gap-2">
        <TableSearchInput className="w-64" table={table} />
        <NewPaymentMethodDialog showShowByDefaultCheckbox save={save} />
      </div>
      <div className="mt-6">
        <Table table={table} columns={columns} />
      </div>
    </div>
  );
}
