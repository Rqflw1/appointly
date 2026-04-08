import { Button } from "@/app/_shadcn/components/ui/button";
import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react";

interface ComponentProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
}

export default function ColumnHeader<TData, TValue>({
  column,
  title
}: ComponentProps<TData, TValue>) {
  if (!column.getCanSort()) return <div>{title}</div>;

  function sort() {
    if (!column.getIsSorted()) column.toggleSorting(false);
    if (column.getIsSorted() === "asc") column.toggleSorting(true);
    if (column.getIsSorted() === "desc") column.clearSorting();
  }

  return (
    <div className="flex items-center">
      <Button variant="ghost" size="sm" className="-ml-3" onClick={sort}>
        <span>{title}</span>
        {column.getIsSorted() === "asc" && <ArrowUp />}
        {column.getIsSorted() === "desc" && <ArrowDown />}
        {!column.getIsSorted() && <ChevronsUpDown />}
      </Button>
    </div>
  );
}
