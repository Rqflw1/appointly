import * as React from "react";

import { cn } from "@/app/_shadcn/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-w-0 min-h-16 w-full p-4 felx bg-input text-secondary-foreground rounded-lg border border-border text-xs transition-all",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "placeholder:text-secondary-foreground",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
