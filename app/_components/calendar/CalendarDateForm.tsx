"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function normalizeDate(input: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const match = input.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return "";
}

interface ComponentProps {
  date: string;
}

export default function CalendarDateForm({ date }: ComponentProps) {
  const router = useRouter();
  const [value, setValue] = useState(date);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeDate(value);
    const target = normalized ? `/calendar?date=${normalized}` : "/calendar";
    router.push(target);
    router.refresh();
  }

  return (
    <form className="flex items-center gap-2" onSubmit={onSubmit}>
      <input
        type="date"
        name="date"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="rounded-md border px-3 py-2 text-sm"
      />
      <button type="submit" className="rounded-md border px-3 py-2 text-sm">
        Go
      </button>
    </form>
  );
}
