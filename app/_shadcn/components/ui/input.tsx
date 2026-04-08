import * as React from "react";

import { cn } from "@/app/_shadcn/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "min-w-0 h-10 w-full px-4 flex items-center bg-input text-secondary-foreground rounded-lg border border-border text-xs transition-all",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
        "placeholder:text-secondary-foreground",
        "selection:bg-primary selection:text-primary-foreground",
        // "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };
