"use client";

import * as React from "react";

import { cn } from "@/app/_shadcn/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-xs", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:hover:bg-secondary", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:nth-child(odd)]:bg-tertiary [&_tr:nth-child(odd)]:hover:bg-hover [&_tr:nth-child(odd)]:data-[state=selected]:bg-hover",
        className
      )}
      {...props}
    />
  );
}

// function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
//   return (
//     <tfoot
//       data-slot="table-footer"
//       className={cn(
//         "bg-accent/50 border-t border-border font-medium [&>tr]:last:border-b-0",
//         className
//       )}
//       {...props}
//     />
//   );
// }

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "bg-secondary hover:bg-hover data-[state=selected]:bg-hover transition-all",
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-secondary-foreground text-left align-middle font-medium whitespace-nowrap",
        "[&:has([role=checkbox])]:pr-0", // [&>[role=checkbox]]:translate-y-[2px]
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-2 py-4 align-middle whitespace-nowrap",
        "[&:has([role=checkbox])]:pr-0", // [&>[role=checkbox]]:translate-y-[2px]
        className
      )}
      {...props}
    />
  );
}

// function TableCaption({
//   className,
//   ...props
// }: React.ComponentProps<"caption">) {
//   return (
//     <caption
//       data-slot="table-caption"
//       className={cn("text-secondary-foreground mt-4 text-sm", className)}
//       {...props}
//     />
//   );
// }

export {
  Table,
  TableHeader,
  TableBody,
  // TableFooter,
  TableHead,
  TableRow,
  TableCell
  // TableCaption
};
