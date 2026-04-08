"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  function changeMode() {
    if (resolvedTheme === "light") setTheme("dark");
    else setTheme("light");
  }

  return (
    <Button variant="secondary" size="icon" onClick={changeMode}>
      <Sun className="block dark:hidden" />
      <Moon className="hidden dark:block" />
    </Button>
  );
}
