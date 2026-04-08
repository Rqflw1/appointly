import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/app/_shadcn/lib/utils";
import clsx from "clsx";

const badgeVariants = cva(
  clsx(
    "min-w-16 w-fit inline-flex justify-center items-center gap-2 shrink-0 rounded-lg whitespace-nowrap text-xs font-medium transition-all overflow-hidden",
    "h-8 px-4 [:has(svg)]:pr-3",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        tertiary: "bg-tertiary text-secondary-foreground",
        destructive: "bg-destructive text-primary-foreground"
      }
    },
    defaultVariants: {
      variant: "tertiary"
    }
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
