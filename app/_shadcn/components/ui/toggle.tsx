"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/app/_shadcn/lib/utils";
import clsx from "clsx";

const toggleVariants = cva(
  clsx(
    "inline-flex justify-center items-center gap-2 shrink-0 rounded-lg whitespace-nowrap text-xs cursor-pointer transition-all",
    "disabled:pointer-events-none disabled:opacity-60",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    "data-[state=on]:bg-hover"
  ),
  {
    variants: {
      variant: {
        secondary: "bg-secondary text-secondary-foreground hover:bg-hover"
      },
      size: {
        default: "h-10 px-4 [:has(svg)]:pr-3",
        icon: "size-10"
      }
    },
    defaultVariants: {
      variant: "secondary",
      size: "default"
    }
  }
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
