import { Table } from "@tanstack/react-table";
import DateRangePicker from "../input/DateRangePicker";
import { DateRangeSchema } from "@/app/_lib/validation/general";
import { DateRange } from "react-day-picker";
import DropdownInput from "../input/DropdownInput";
import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { DocumentWithPartners } from "@/app/_lib/types/document";
import {
  shiftDateToLocal,
  shiftDateToUTC
} from "@/app/_lib/functions/document";

export enum Period {
  THIS_MONTH = "THIS_MONTH",
  LAST_MONTH = "LAST_MONTH",
  THIS_YEAR = "THIS_YEAR",
  LAST_YEAR = "LAST_YEAR",
  ALL_TIME = "ALL_TIME",
  CUSTOM = "CUSTOM"
}

const periods = Object.values(Period).filter(
  (period) => period !== Period.CUSTOM
);

export function getDateRangeForPeriod(
  period: Period,
  now: Date = new Date()
): DateRange {
  switch (period) {
    case Period.THIS_MONTH: {
      const from = shiftDateToUTC(
        new Date(now.getFullYear(), now.getMonth(), 1)
      );
      const to = new Date(
        shiftDateToUTC(
          new Date(now.getFullYear(), now.getMonth() + 1, 1)
        ).getTime() - 1
      );
      return { from, to };
    }
    case Period.LAST_MONTH: {
      const from = shiftDateToUTC(
        new Date(now.getFullYear(), now.getMonth() - 1, 1)
      );
      const to = new Date(
        shiftDateToUTC(new Date(now.getFullYear(), now.getMonth(), 1)).getTime() -
          1
      );
      return { from, to };
    }
    case Period.THIS_YEAR: {
      const from = shiftDateToUTC(new Date(now.getFullYear(), 0, 1));
      const to = new Date(
        shiftDateToUTC(new Date(now.getFullYear() + 1, 0, 1)).getTime() - 1
      );
      return { from, to };
    }
    case Period.LAST_YEAR: {
      const from = shiftDateToUTC(new Date(now.getFullYear() - 1, 0, 1));
      const to = new Date(
        shiftDateToUTC(new Date(now.getFullYear(), 0, 1)).getTime() - 1
      );
      return { from, to };
    }
    case Period.ALL_TIME:
    case Period.CUSTOM:
    default:
      return { from: undefined, to: undefined };
  }
}

interface ComponentProps {
  table: Table<DocumentWithPartners>;
  period: Period;
  onPeriodChange: (period: Period) => void;
}

export default function DateFilter({
  table,
  period,
  onPeriodChange
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const dateColumn = table.getColumn("docDate");
  const zRes = DateRangeSchema.safeParse(dateColumn?.getFilterValue());
  const selectedDateRange: DateRange = {
    from: zRes.data?.from,
    to: zRes.data?.to
  };

  function setFilterValue(value: DateRange) {
    dateColumn?.setFilterValue(value);
  }

  const now = new Date();
  const ranges: Record<Period, DateRange> = {
    [Period.THIS_MONTH]: getDateRangeForPeriod(Period.THIS_MONTH, now),
    [Period.LAST_MONTH]: getDateRangeForPeriod(Period.LAST_MONTH, now),
    [Period.THIS_YEAR]: getDateRangeForPeriod(Period.THIS_YEAR, now),
    [Period.LAST_YEAR]: getDateRangeForPeriod(Period.LAST_YEAR, now),
    [Period.ALL_TIME]: getDateRangeForPeriod(Period.ALL_TIME, now),
    [Period.CUSTOM]: getDateRangeForPeriod(Period.CUSTOM, now)
  };

  function onDateRangeChange(value: DateRange | undefined) {
    if (!value) value = { from: undefined, to: undefined };
    if (value.from) value.from = shiftDateToUTC(value.from);
    if (value.to) value.to = shiftDateToUTC(value.to, 23, 59, 59, 999);

    setFilterValue(value);

    if (
      value.from?.getTime() === ranges[Period.THIS_MONTH].from?.getTime() &&
      value.to?.getTime() === ranges[Period.THIS_MONTH].to?.getTime()
    )
      onPeriodChange(Period.THIS_MONTH);
    else if (
      value.from?.getTime() === ranges[Period.LAST_MONTH].from?.getTime() &&
      value.to?.getTime() === ranges[Period.LAST_MONTH].to?.getTime()
    )
      onPeriodChange(Period.LAST_MONTH);
    else if (
      value.from?.getTime() === ranges[Period.THIS_YEAR].from?.getTime() &&
      value.to?.getTime() === ranges[Period.THIS_YEAR].to?.getTime()
    )
      onPeriodChange(Period.THIS_YEAR);
    else if (
      value.from?.getTime() === ranges[Period.LAST_YEAR].from?.getTime() &&
      value.to?.getTime() === ranges[Period.LAST_YEAR].to?.getTime()
    )
      onPeriodChange(Period.LAST_YEAR);
    else if (value.from === undefined && value.to === undefined)
      onPeriodChange(Period.ALL_TIME);
    else onPeriodChange(Period.CUSTOM);
  }

  function handlePeriodChange(nextPeriod: Period | null) {
    if (!nextPeriod) return;
    onPeriodChange(nextPeriod);
    setFilterValue(ranges[nextPeriod]);
  }

  return (
    <div className="flex gap-2">
      <DateRangePicker
        className="min-w-64"
        value={{
          from:
            selectedDateRange.from && shiftDateToLocal(selectedDateRange.from),
          to: selectedDateRange.to && shiftDateToLocal(selectedDateRange.to)
        }}
        onChange={onDateRangeChange}
      />
      <DropdownInput
        selected={period}
        options={periods}
        renderOption={(option) => dict.datePeriod[option]}
        onChange={handlePeriodChange}
      />
    </div>
  );
}
