"use client";

import { v4 as uuidv4 } from "uuid";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import { useContext, useEffect, useMemo, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import ColumnHeader from "../table/ColumnHeader";
import { Button } from "@/app/_shadcn/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import NumberInput from "../input/NumberInput";
import {
  calculatePriceProps,
  compareNumbers,
  round,
  toFixed,
  toString
} from "@/app/_lib/functions/general";
import { CreateItemModelRow } from "@/app/_lib/types/item";
import Table from "../general/Table";
import ItemInput from "../input/ItemInput";
import UnitInput from "../input/UnitInput";
import { SetState } from "@/app/_lib/types/general";
import { Checkbox } from "@/app/_shadcn/components/ui/checkbox";
import { Label } from "@/app/_shadcn/components/ui/label";
import { emptyItem } from "@/app/_lib/constants/document";
import DiscountOrVatInput from "./DiscountOrVatInput";
import NoteInput from "./NoteInput";
import InputWithDropdown from "../input/InputWithDropdown";
import CurrencyRateInput from "./CurrencyRateInput";
import PaymentTypeInput from "./PaymentTypeInput";
import { Company, Item, Language, Unit } from "@/app/_prisma/browser";
import AddPrepaymentInvoiceDialog from "./AddPrepaymentInvoiceDialog";
import { amountToWords, amountWithCurrency } from "@/app/_lib/functions/document";
import { CreateDocumentSettlementRow } from "@/app/_lib/types/document";

const columnHelper = createColumnHelper<CreateItemModelRow>();

interface ComponentProps {
  company: Company;
  units: Unit[];
  //
  itemsInput: [CreateItemModelRow[], SetState<CreateItemModelRow[]>];
  multipleVatInput: [boolean, SetState<boolean>];
  multipleDiscountInput: [boolean, SetState<boolean>];
  noteInput: [string, SetState<string>];
  language: Language;
  currency: string;
  discountRateInput: [number, SetState<number>];
  vatRateInput: [number, SetState<number>];
  baseTotal: number;
  discountTotal: number;
  netTotal: number;
  nonTaxableNetTotal: number;
  vats: Map<number, { taxableNetTotal: number; vatTotal: number }>;
  subtotal: number;
  lateFeeTotal: number;
  grossTotal: number;
  currencyRateInput: [number, SetState<number>];
  showCurrencyRateInput: [boolean, SetState<boolean>];
  paymentMethodTypeInput: [string, SetState<string>];
  fromDocumentsInput: [
    CreateDocumentSettlementRow[],
    SetState<CreateDocumentSettlementRow[]>
  ];
}

export default function ItemsTable({
  company,
  units,
  itemsInput: [items, setItems],
  multipleVatInput: [multipleVat, setMultipleVat],
  multipleDiscountInput: [multipleDiscount, setMultipleDiscount],
  noteInput,
  language,
  currency,
  discountRateInput,
  vatRateInput,
  baseTotal,
  discountTotal,
  netTotal,
  nonTaxableNetTotal,
  vats,
  subtotal,
  lateFeeTotal,
  grossTotal,
  currencyRateInput,
  showCurrencyRateInput: [showCurrencyRate, setShowCurrencyRate],
  paymentMethodTypeInput,
  fromDocumentsInput: [fromDocuments, setFromDocuments]
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [discountRate] = discountRateInput;
  const [vatRate] = vatRateInput;
  const [currencyRate] = currencyRateInput;
  const totalInWords = useMemo(
    () => amountToWords(grossTotal, currency, language),
    [grossTotal, currency, language]
  );

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    discountRate: multipleDiscount,
    vatRate: multipleVat
  });

  useEffect(() => {
    setColumnVisibility({
      discountRate: multipleDiscount,
      vatRate: multipleVat
    });
  }, [multipleDiscount, multipleVat]);

  const columns = useMemo(() => {
    function changeRow<K extends keyof CreateItemModelRow>(
      index: number,
      key: K,
      value: CreateItemModelRow[K]
    ) {
      setItems((old) =>
        old.map((row, i) => {
          if (i !== index) return row;

          const newRow = { ...row, [key]: value };
          return { ...newRow, ...calculatePriceProps(newRow) };
        })
      );
    }

    function addRow(index: number) {
      const row: CreateItemModelRow = {
        ...structuredClone(emptyItem),
        rowId: uuidv4(),
        currency,
        discountRate,
        vatRate
      };

      setItems((old) => [
        ...old.slice(0, index + 1),
        { ...row, ...calculatePriceProps(row) },
        ...old.slice(index + 1)
      ]);
    }

    function deleteRow(index: number) {
      setItems((old) => old.filter((_, i) => i !== index));
    }

    return [
      columnHelper.display({
        id: "id",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            <ColumnHeader column={column} title={"#"} />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            {row.index + 1}
          </div>
        ),
        size: 40
      }),
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.itemName} />
        ),
        cell: ({ row }) => {
          const [value, setValue] = useState(row.original.name);
          useEffect(() => setValue(row.original.name), [row]);

          function onSelect(option: Item) {
            setValue(option.name);
            setItems((old) =>
              old.map((item, i) => {
                if (i !== row.index) return item;

                const { sku, name, description, unit } = option;
                const { basePrice, discountRate, vatRate } = option;

                const newRow: CreateItemModelRow = {
                  ...item,
                  sku,
                  name,
                  description,
                  unit,
                  quantity: 1,
                  basePrice,
                  discountRate,
                  vatRate: vatRate ?? NaN
                };

                return { ...newRow, ...calculatePriceProps(newRow) };
              })
            );
          }

          return (
            <ItemInput
              value={value}
              onChange={(value) => setValue(value)}
              onSelect={onSelect}
              onClose={() => changeRow(row.index, "name", value)}
            />
          );
        }
      }),
      columnHelper.accessor("unit", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.unit} />
        ),
        cell: ({ row }) => {
          const [value, setValue] = useState(row.original.unit);
          useEffect(() => setValue(row.original.unit), [row]);

          return (
            <UnitInput
              units={units}
              value={value}
              onChange={(value) => setValue(value)}
              onSelect={(option) => setValue(option.name)}
              onClose={() => changeRow(row.index, "unit", value)}
            />
          );
        },
        size: 96
      }),
      columnHelper.accessor("quantity", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.quantity} />
        ),
        cell: ({ row }) => {
          const [value, setValue] = useState(toString(row.original.quantity));
          useEffect(() => setValue(toString(row.original.quantity)), [row]);
          return (
            <NumberInput
              value={value}
              onChange={(value) => setValue(value)}
              onBlur={() => {
                const number = parseFloat(value);
                changeRow(row.index, "quantity", number);
                setValue(toString(number));
              }}
            />
          );
        },
        size: 96
      }),
      columnHelper.accessor("basePrice", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.basePrice} />
        ),
        cell: ({ row }) => {
          const [value, setValue] = useState("");
          useEffect(() => setValue(toFixed(row.original.basePrice, 4)), [row]);
          return (
            <NumberInput
              value={value}
              onChange={(value) => setValue(value)}
              onBlur={() => {
                const number = round(parseFloat(value), 4);
                changeRow(row.index, "basePrice", number);
                setValue(toFixed(number, 4));
              }}
            />
          );
        },
        size: 120
      }),
      columnHelper.accessor("discountRate", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.discountRate} />
        ),
        cell: ({ row }) => {
          const [value, setValue] = useState(
            toFixed(row.original.discountRate * 100, 2)
          );

          useEffect(
            () => setValue(toFixed(row.original.discountRate * 100, 2)),
            [row]
          );

          return (
            <InputWithDropdown
              type="number"
              className="w-full"
              value={value}
              options={[0, 5, 10, 15, 20, 25, 30]}
              renderValue={(value) => {
                const number = parseFloat(value);
                if (isNaN(number)) return "";
                return `${value} %`;
              }}
              renderOption={(option) => `${option} %`}
              getIsSelected={(value, _, option) =>
                compareNumbers(parseFloat(value), option)
              }
              onChange={(value) => setValue(value)}
              onSelect={(option) => setValue(toString(option))}
              onClose={() => {
                const number = round(parseFloat(value) * 0.01, 4) || 0;
                changeRow(row.index, "discountRate", number);
                setValue(toFixed(number * 100, 2));
              }}
            />
          );
        },
        size: 120
      }),
      columnHelper.accessor("vatRate", {
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.vatRate} />
        ),
        cell: ({ row }) => {
          const [value, setValue] = useState(
            toFixed((row.original.vatRate ?? NaN) * 100, 2)
          );

          useEffect(
            () => setValue(toFixed((row.original.vatRate ?? NaN) * 100, 2)),
            [row]
          );

          return (
            <InputWithDropdown
              type="number"
              className="w-full"
              value={value}
              options={[NaN, 0, 5, 12, 21]}
              renderValue={(value) => {
                const number = parseFloat(value);
                if (isNaN(number)) return dict.labels.none;
                return `${value} %`;
              }}
              renderOption={(option) => {
                if (isNaN(option)) return dict.labels.none;
                return `${option} %`;
              }}
              getIsSelected={(value, _, option) =>
                compareNumbers(parseFloat(value), option)
              }
              onChange={(value) => setValue(value)}
              onSelect={(option) => setValue(toString(option))}
              onClose={() => {
                const number = round(parseFloat(value) * 0.01, 4);
                changeRow(row.index, "vatRate", number);
                setValue(toFixed(number * 100, 2));
              }}
            />
          );
        },
        size: 120
      }),
      columnHelper.display({
        id: "netTotal",
        header: ({ column }) => (
          <ColumnHeader column={column} title={dict.labels.total} />
        ),
        cell: ({ row }) => {
          return <NumberInput value={toFixed(row.original.netTotal, 2)} />;
        },
        size: 120
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row, table }) => (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => addRow(row.index)}
            >
              <Plus />
            </Button>
            <Button
              disabled={table.getRowCount() === 1}
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => deleteRow(row.index)}
            >
              <Trash2 />
            </Button>
          </>
        ),
        size: 96
      })
    ];
  }, [dict, discountRate, vatRate]);

  const table = useReactTable({
    data: items,
    columns,
    state: {
      columnVisibility
    },
    enableSorting: false,
    //
    onColumnVisibilityChange: setColumnVisibility,
    //
    getCoreRowModel: getCoreRowModel()
  });

  const discountColumn = table.getColumn("discountRate");
  const vatColumn = table.getColumn("vatRate");

  return (
    <div>
      <div className="flex justify-end gap-8">
        {discountColumn && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="discountColumn"
              checked={discountColumn.getIsVisible()}
              onCheckedChange={(value) => {
                setMultipleDiscount(!!value);
                setItems((old) =>
                  old.map((row) => {
                    const newRow = { ...row, discountRate };
                    return { ...newRow, ...calculatePriceProps(newRow) };
                  })
                );
              }}
            />
            <Label htmlFor="discountColumn">
              {dict.labels.multipleDiscountRates}
            </Label>
          </div>
        )}
        {vatColumn && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="vatColumn"
              checked={vatColumn.getIsVisible()}
              onCheckedChange={(value) => {
                setMultipleVat(!!value);

                setItems((old) =>
                  old.map((row) => {
                    const newRow = { ...row, vatRate };
                    return { ...newRow, ...calculatePriceProps(newRow) };
                  })
                );
              }}
            />
            <Label htmlFor="vatColumn">{dict.labels.multipleVatRates}</Label>
          </div>
        )}
      </div>
      <div className="mt-4 p-8 bg-secondary rounded-3xl">
        <Table table={table} columns={columns} />
        <div className="mt-8 grid grid-cols-2">
          <div></div>
          <div className="flex flex-col gap-2 text-xs text-secondary-foreground">
            <div className="flex justify-between">
              <div>{dict.labels.totalBeforeDiscount}</div>
              <div>{amountWithCurrency(toFixed(baseTotal, 2), currency)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>{dict.labels.discount}</div>
                {!multipleDiscount && (
                  <div>
                    <DiscountOrVatInput
                      type="discount"
                      rateInput={discountRateInput}
                      setItems={setItems}
                    />
                  </div>
                )}
              </div>
              <div>
                {amountWithCurrency(toFixed(discountTotal, 2), currency)}
              </div>
            </div>
            <div className="flex justify-between">
              <div>{dict.labels.totalWithoutVat}</div>
              <div>{amountWithCurrency(toFixed(netTotal, 2), currency)}</div>
            </div>
            {!multipleVat && isNaN(vatRate) && (
              <div className="flex items-center gap-2">
                <div>{dict.labels.vatRate}</div>
                <div>
                  <DiscountOrVatInput
                    type="vat"
                    rateInput={vatRateInput}
                    setItems={setItems}
                  />
                </div>
              </div>
            )}
            {nonTaxableNetTotal > 0 && (
              <div className="flex justify-between">
                <div>{dict.texts.nonTaxable(nonTaxableNetTotal, currency)}</div>
              </div>
            )}
            {Array.from(vats.entries()).map(
              ([vatRate, { taxableNetTotal, vatTotal }], key) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    {!multipleVat &&
                      dict.texts.vatFromWithInput(
                        <DiscountOrVatInput
                          type="vat"
                          rateInput={vatRateInput}
                          setItems={setItems}
                        />,
                        taxableNetTotal,
                        currency
                      )}
                    {multipleVat &&
                      dict.texts.vatFrom(vatRate, taxableNetTotal, currency)}
                  </div>
                  <div>
                    {amountWithCurrency(toFixed(vatTotal, 2), currency)}
                  </div>
                </div>
              )
            )}
            <div className="flex justify-between">
              <div>{dict.labels.subtotal}</div>
              <div>{amountWithCurrency(toFixed(subtotal, 2), currency)}</div>
            </div>
            {fromDocuments.map((document, key) => {
              return (
                <div key={key} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div>
                      {dict.texts.prepaymentInvoiceWithId(
                        document.fromDocument.docNum
                      )}
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() =>
                          setFromDocuments((old) =>
                            old.filter(({ rowId }) => rowId !== document.rowId)
                          )
                        }
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                  <div>
                    {amountWithCurrency(toFixed(document.amount, 2), currency)}
                  </div>
                </div>
              );
            })}
            {lateFeeTotal > 0 && (
              <div className="flex justify-between">
                <div>{dict.texts.lateFee(language)}</div>
                <div>
                  {amountWithCurrency(toFixed(lateFeeTotal, 2), currency)}
                </div>
              </div>
            )}
            <div className="">
              <AddPrepaymentInvoiceDialog setFromDocuments={setFromDocuments} />
            </div>
            <div className="pt-4 text-sm text-foreground font-semibold flex justify-between">
              <div>{dict.labels.total}</div>
              <div>{amountWithCurrency(toFixed(grossTotal, 2), currency)}</div>
            </div>
            {totalInWords && (
              <div className="pt-1 text-2xs text-secondary-foreground text-wrap">
                {`${dict.labels.totalInWords}: ${totalInWords}`}
              </div>
            )}
            {currency !== company.currency && (
              <>
                <div className="pt-8 flex items-center gap-2">
                  <div>{`${dict.labels.exchangeRate}: 1 ${currency} =`}</div>
                  <CurrencyRateInput currencyRateInput={currencyRateInput} />
                  <div>{company.currency}</div>
                </div>
                <div className="pt-4 flex justify-between">
                  <div>{`${dict.labels.total} (1 ${currency} = ${toFixed(
                    currencyRate,
                    4
                  )} ${company.currency})`}</div>
                  <div>
                    {amountWithCurrency(
                      toFixed(grossTotal * currencyRate, 2),
                      company.currency
                    )}
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <Checkbox
                    id="showCurrencyRate"
                    checked={showCurrencyRate}
                    onCheckedChange={(value) => setShowCurrencyRate(!!value)}
                  />
                  <Label htmlFor="showCurrencyRate">
                    {dict.labels.showCurrencyRate}
                  </Label>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="mt-6">
          <PaymentTypeInput typeInput={paymentMethodTypeInput} />
        </div>
        <div className="mt-6">
          <NoteInput noteInput={noteInput} />
        </div>
      </div>
    </div>
  );
}
