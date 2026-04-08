"use client";

import { signOutAction } from "@/app/_lib/serverActions/auth";

interface ComponentProps {
  user: { name: string };
  csrfToken: string;
}

export default function Topbar({ user, csrfToken }: ComponentProps) {
  return (
    <header className="flex items-center justify-between border-b bg-white/80 px-6 py-3 backdrop-blur">
      <div>
        <div className="text-sm text-muted-foreground">Welcome back</div>
        <div className="text-base font-semibold">{user.name}</div>
      </div>
      <form action={signOutAction}>
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <button
          type="submit"
          className="text-sm font-medium text-foreground/80 hover:text-foreground"
        >
          Sign out
        </button>
      </form>
    </header>
  );
}
