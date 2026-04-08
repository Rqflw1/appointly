"use client";

import { signOutAction } from "@/app/_lib/serverActions/auth";
import { updateLanguageAction } from "@/app/_lib/serverActions/user";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Language } from "@/app/_prisma/enums";
import { useContext } from "react";
import { LocaleContext } from "@/app/_components/context/LocaleProvider";

interface ComponentProps {
  user: { name: string; language?: Language };
  language: Language;
  csrfToken: string;
}

export default function Topbar({ user, language, csrfToken }: ComponentProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { dict } = useContext(LocaleContext);

  function onLanguageChange(value: string) {
    const formData = new FormData();
    formData.append("csrfToken", csrfToken);
    formData.append("language", value);
    startTransition(async () => {
      await updateLanguageAction(formData);
      router.refresh();
    });
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-background/80 px-6 py-3 backdrop-blur">
      <div>
        <div className="text-sm text-muted-foreground">
          {dict.labels.welcomeBack}
        </div>
        <div className="text-base font-semibold">{user.name}</div>
      </div>
      <div className="flex items-center gap-3">
        <select
          className="rounded-md border border-border bg-background px-2 py-2 text-sm"
          value={language}
          onChange={(event) => onLanguageChange(event.target.value)}
          disabled={isPending}
          aria-label="Language"
        >
          <option value={Language.EN}>EN</option>
          <option value={Language.RU}>RU</option>
          <option value={Language.LV}>LV</option>
        </select>
        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
        </button>
        <form action={signOutAction}>
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <button
            type="submit"
            className="text-sm font-medium text-foreground/80 hover:text-foreground"
          >
            {dict.labels.signOut}
          </button>
        </form>
      </div>
    </header>
  );
}
