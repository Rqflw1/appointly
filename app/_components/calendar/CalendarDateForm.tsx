"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { LocaleContext } from "@/app/_components/context/LocaleProvider";

function normalizeDate(input: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const match = input.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return "";
}

interface ComponentProps {
  from: string;
  to: string;
}

export default function CalendarDateForm({ from, to }: ComponentProps) {
  const router = useRouter();
  const [fromValue, setFromValue] = useState(from);
  const [toValue, setToValue] = useState(to);
  const { dict } = useContext(LocaleContext);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedFrom = normalizeDate(fromValue);
    const normalizedTo = normalizeDate(toValue);
    const params = new URLSearchParams();
    if (normalizedFrom) params.set("from", normalizedFrom);
    if (normalizedTo) params.set("to", normalizedTo);
    const query = params.toString();
    const target = query ? `/calendar?${query}` : "/calendar";
    router.push(target);
    router.refresh();
  }

  return (
    <form className="flex items-center gap-2" onSubmit={onSubmit}>
      <input
        type="date"
        name="from"
        value={fromValue}
        onChange={(event) => setFromValue(event.target.value)}
        className="rounded-md border px-3 py-2 text-sm"
      />
      <span className="text-sm text-muted-foreground">to</span>
      <input
        type="date"
        name="to"
        value={toValue}
        onChange={(event) => setToValue(event.target.value)}
        className="rounded-md border px-3 py-2 text-sm"
      />
      <button type="submit" className="rounded-md border px-3 py-2 text-sm">
        {dict.labels.go}
      </button>
    </form>
  );
}
