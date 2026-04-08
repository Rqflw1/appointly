"use client";

import { v4 as uuidv4 } from "uuid";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  Row,
  useReactTable
} from "@tanstack/react-table";
import ColumnHeader from "../table/ColumnHeader";
import { Dispatch, SetStateAction, useContext, useMemo, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { CreatePaymentMethodModelRow } from "@/app/_lib/types/paymentMethod";
import PaymentMethodRowActions from "./PaymentMethodRowActions";
import Table from "../general/Table";
import { removeDiacritics } from "@/app/_lib/functions/general";
import TableSearchInput from "../input/TableSearchInput";
import NewPaymentMethodDialog from "../paymentMethod/NewPaymentMethodDialog";
import { PaymentMethodType } from "@/app/_prisma/enums";
import { SetState } from "@/app/_lib/types/general";

const columnHelper = createColumnHelper<CreatePaymentMethodModelRow>();

interface ComponentProps {
  showPaymentMethodInput?: boolean;
  isPartner?: boolean;
  partnerRegNum?: string;

  paymentMethods: CreatePaymentMethodModelRow[];
  setPaymentMethods: Dispatch<SetStateAction<CreatePaymentMethodModelRow[]>>;
}

export default function PaymentMethodsTab({
  showPaymentMethodInput,
  isPartner,
  partnerRegNum,

  paymentMethods,
  setPaymentMethods
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

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

    setPaymentMethods((old) => [
      ...old,
      { rowId: uuidv4(), type, name, accNum, note, showByDefault, field_1 }
    ]);
    setIsOpen(false);
  }

  function globalFilterFn(
    row: Row<CreatePaymentMethodModelRow>,
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
      columnHelper.accessor("type", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.type} />
        ),
        cell: ({ row }) => (
          <div>{dict.paymentMethodType[row.original.type]}</div>
        ),
        size: 56
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
      columnHelper.accessor("note", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.note} />
        ),
        cell: ({ row }) => <div>{row.original.note}</div>
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => (
          <PaymentMethodRowActions
            showPaymentMethodInput={showPaymentMethodInput}
            isPartner={isPartner}
            partnerRegNum={partnerRegNum}
            row={row}
            setPaymentMethods={setPaymentMethods}
          />
        ),
        size: 56
      })
    ];
  }, [dict, showPaymentMethodInput, isPartner, partnerRegNum]);

  const table = useReactTable({
    data: paymentMethods,
    columns,
    state: {
      globalFilter
    },
    enableSorting: false,
    //
    globalFilterFn,
    //
    onGlobalFilterChange: setGlobalFilter,
    //
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  return (
    <div className="p-6 bg-secondary rounded-3xl">
      <div className="font-semibold text-foreground">
        {dict.labels.paymentMethods}
      </div>
      <div className="mt-6 flex justify-between gap-2">
        <TableSearchInput className="w-64" table={table} />
        <NewPaymentMethodDialog
          showPaymentMethodInput={showPaymentMethodInput}
          isPartner={isPartner}
          partnerRegNum={partnerRegNum}
          save={save}
        />
      </div>
      <div className="mt-4">
        <Table table={table} columns={columns} />
      </div>
    </div>
  );
}
