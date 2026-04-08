import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/_shadcn/lib/utils";
import { LoaderCircle } from "lucide-react";
import { LocaleContext } from "@/app/_components/context/LocaleProvider";
import clsx from "clsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/app/_shadcn/components/ui/tooltip";

const buttonVariants = cva(
  clsx(
    "inline-flex justify-center items-center gap-2 shrink-0 rounded-lg whitespace-nowrap text-xs cursor-pointer transition-all",
    "disabled:pointer-events-none disabled:opacity-60",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-hover",
        tertiary: "bg-tertiary text-secondary-foreground hover:bg-hover",
        ghost: "bg-transparent text-secondary-foreground hover:bg-hover",
        input: "border border-border bg-input text-secondary-foreground",
        link: "bg-transparent text-accent-foreground underline-offset-2 hover:underline",
        destructive:
          "bg-destructive text-primary-foreground hover:bg-destructive/70"
      },
      size: {
        default: "h-10 px-4 [:has(svg)]:pr-3",
        sm: "h-8 gap-1.5 px-3 [:has(svg)]:pr-2.5",
        icon: "size-10",
        "icon-sm": "size-8",
        link: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

interface ComponentProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

function Button(props: ComponentProps) {
  const { size, title } = props;
  const shouldShowTooltip = !!title && (size === "icon" || size === "icon-sm");

  if (!shouldShowTooltip) return <ButtonComponent {...props} />;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ButtonComponent {...props} />
      </TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  );
}

export { Button, buttonVariants };

function ButtonComponent({
  children,
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  ...props
}: ComponentProps) {
  const { dict } = React.useContext(LocaleContext);

  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {!isLoading && children}
      {isLoading && (
        <>
          <LoaderCircle className="animate-spin" />
          {size !== "icon" && size !== "icon-sm" && (
            <span>{dict.labels.loading}</span>
          )}
        </>
      )}
    </Comp>
  );
}
