"use client";

import { Input } from "@/app/_shadcn/components/ui/input";
import { Table } from "@tanstack/react-table";
import { useContext, useEffect, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useDebounce } from "@/app/_lib/hooks/useDebounce";
import { Search } from "lucide-react";
import { cn } from "@/app/_shadcn/lib/utils";

interface ComponentProps {
  className?: string;
  table: Table<any>;
}

export default function TableSearchInput({ className, table }: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [search, setSearch] = useState("");
  const searchDebounced = useDebounce(search);

  useEffect(() => table.setGlobalFilter(searchDebounced), [searchDebounced]);
  useEffect(() => setSearch(String(table.getState().globalFilter)), [table]);

  return (
    <div className="relative flex items-center w-fit">
      <Search className="absolute right-3 size-4 text-secondary-foreground" />
      <Input
        className={cn("pr-8", className)}
        type="text"
        placeholder={`${dict.labels.search}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
