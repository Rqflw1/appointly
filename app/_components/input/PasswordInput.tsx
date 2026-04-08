"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/app/_shadcn/components/ui/input";
import { cn } from "@/app/_shadcn/lib/utils";

interface ComponentProps extends Omit<
  React.ComponentProps<typeof Input>,
  "type"
> {
  defaultVisible?: boolean;
}

export default function PasswordInput({
  className,
  defaultVisible,
  disabled,
  ...props
}: ComponentProps) {
  const [isVisible, setIsVisible] = useState(!!defaultVisible);

  return (
    <div className="relative">
      <Input
        {...props}
        type={isVisible ? "text" : "password"}
        disabled={disabled}
        className={cn("pr-12", className)}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsVisible(!isVisible)}
        className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 text-secondary-foreground transition-colors",
          "hover:text-foreground",
          "disabled:pointer-events-none disabled:opacity-60"
        )}
      >
        {isVisible ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
