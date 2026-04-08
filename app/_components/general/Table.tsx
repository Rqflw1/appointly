import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/app/_shadcn/components/ui/table";
import {
  ColumnDef,
  flexRender,
  Table as TanstackTable
} from "@tanstack/react-table";
import { CSSProperties } from "react";
import NoResultsRow from "../table/NoResultsRow";

interface ComponentProps<T> {
  table: TanstackTable<T>;
  columns: ColumnDef<T, any>[];
}

export default function Table<T>({ table, columns }: ComponentProps<T>) {
  const rows = table.getRowModel().rows;

  return (
    <ShadcnTable>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            key={headerGroup.id}
            className="border-b border-secondary-foreground"
          >
            {headerGroup.headers.map((header) => {
              const style: CSSProperties = {};
              const width = header.getSize();
              if (width !== 150) style.width = `${header.getSize()}px`;

              return (
                <TableHead key={header.id} className="" style={style}>
                  {!header.isPlaceholder &&
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
        {rows.length === 0 && <NoResultsRow columns={columns} />}
      </TableBody>
    </ShadcnTable>
  );
}
