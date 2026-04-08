"use client";

import {
  Area,
  AreaChart,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis
} from "recharts";
import { useContext, useEffect, useState } from "react";
import { Table } from "@tanstack/react-table";
import { DateRangeSchema } from "@/app/_lib/validation/general";
import {
  formatDateShortWithoutYear,
  toFixed
} from "@/app/_lib/functions/general";
import { DocumentWithPartners } from "@/app/_lib/types/document";
import { LocaleContext } from "../context/LocaleProvider";
import { Payload } from "recharts/types/component/DefaultTooltipContent";
import { Company, Document } from "@/app/_prisma/browser";
import {
  amountWithCurrency,
  shiftDateToLocal,
  shiftDateToUTC
} from "@/app/_lib/functions/document";

interface ChartDay {
  date: string;
  amount: number;
}

interface ComponentProps {
  company: Company;
  table: Table<DocumentWithPartners>;
  documents: Document[];
}

export function DocumentsChart({ company, table, documents }: ComponentProps) {
  const { dict, language } = useContext(LocaleContext);
  const dateFilter = table.getColumn("docDate")?.getFilterValue();

  const [days, setDays] = useState<ChartDay[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const range = DateRangeSchema.safeParse(dateFilter).data;

    let startDay = range?.from ? new Date(range.from) : undefined;
    let endDay = range?.to ? new Date(range.to) : undefined;

    const dayTotals = new Map<string, number>();
    table.getFilteredRowModel().rows.forEach(({ original: doc }) => {
      const docDate = new Date(doc.docDate);
      const isoDate = docDate.toISOString();

      let docTotal = doc.grossTotal;
      if (doc.currency !== company.currency)
        docTotal = doc.grossTotal * doc.currencyRate;
      dayTotals.set(isoDate, (dayTotals.get(isoDate) || 0) + docTotal);

      if (!startDay) startDay = docDate;
      if (!endDay) endDay = docDate;

      if (docDate < startDay) startDay = docDate;
      if (docDate > endDay) endDay = docDate;
    });

    if (startDay === undefined) startDay = shiftDateToUTC(new Date());
    if (endDay === undefined) endDay = new Date(startDay);

    let total = 0;
    const days: ChartDay[] = [];
    let day = new Date(startDay);
    while (day <= endDay) {
      const dayTotal = dayTotals.get(day.toISOString()) || 0;
      days.push({ date: day.toISOString(), amount: dayTotal });
      total = total + dayTotal;
      day.setDate(day.getDate() + 1);
    }

    setDays(days);
    setTotal(total);
  }, [dateFilter, documents]);

  return (
    <div>
      <div className="flex items-center">
        <div>
          <div className="text-sm text-secondary-foreground">
            {dict.labels.totalAmount}
          </div>
          <div className="text-2xl font-semibold">
            {amountWithCurrency(toFixed(total, 2), company.currency)}
          </div>
        </div>
      </div>
      <AreaChart className="mt-8 w-full h-64" responsive data={days}>
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--accent-foreground)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--accent-foreground)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          type="category"
          axisLine={false}
          tickLine={false}
          tick={{ className: "fill-secondary-foreground text-xs" }}
          tickFormatter={(value) =>
            formatDateShortWithoutYear(
              shiftDateToLocal(new Date(value)),
              language
            )
          }
          tickMargin={8}
          minTickGap={32}
        />
        <YAxis
          width="auto"
          axisLine={false}
          tickLine={false}
          tick={{ className: "fill-secondary-foreground text-xs" }}
          tickFormatter={(value) => amountWithCurrency(value, company.currency)}
          tickMargin={8}
          minTickGap={16}
        />
        <Tooltip
          cursor={false}
          content={(props) => <CustomTooltip {...props} company={company} />}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="var(--accent-foreground)"
          strokeWidth={2}
          // fillOpacity={1}
          fill="url(#colorAmount)"
        />
      </AreaChart>
    </div>
  );
}

type ValueType = number | string | Array<number | string>;
type NameType = number | string;
interface CustomTooltipProps<
  TValue extends ValueType,
  TName extends NameType
> extends TooltipContentProps<TValue, TName> {
  company: Company;
  payload: Payload<TValue, TName>[];
}

function CustomTooltip<TValue extends ValueType, TName extends NameType>({
  company,
  active,
  payload,
  label,
  ...rest
}: CustomTooltipProps<TValue, TName>) {
  const { dict, language } = useContext(LocaleContext);

  const isVisible = active && payload && payload.length > 0;
  const value = payload.at(0)?.value;

  if (!isVisible) return null;
  return (
    <div className="min-w-48 p-2 rounded-lg bg-popover text-popover-foreground text-xs shadow-md">
      <div className="p-2 flex justify-between">
        <div>{dict.labels.date}</div>
        {label && (
          <div className="text-foreground">
            {formatDateShortWithoutYear(
              shiftDateToLocal(new Date(label)),
              language
            )}
          </div>
        )}
      </div>
      <div className="h-px bg-border"></div>
      <div className="p-2 flex justify-between">
        <div>{dict.labels.amount}</div>
        {typeof value === "number" && (
          <div className="text-accent-foreground font-semibold">
            {amountWithCurrency(toFixed(value, 2), company.currency)}
          </div>
        )}
      </div>
    </div>
  );
}
