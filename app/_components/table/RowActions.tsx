"use client";

import { buttonVariants } from "@/app/_shadcn/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger
} from "@/app/_shadcn/components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";
import { ReactNode } from "react";

import { cn } from "@/app/_shadcn/lib/utils";

interface ComponentProps {
  children: ReactNode;
}

export default function RowActions({ children }: ComponentProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({
            variant: "ghost",
            size: "icon",
            className: "data-[state=open]:bg-hover"
          })
        )}
      >
        <Ellipsis />
      </DropdownMenuTrigger>
      {children}
    </DropdownMenu>
  );
}
