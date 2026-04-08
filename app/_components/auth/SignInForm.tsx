"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInAction } from "@/app/_lib/serverActions/auth";

interface ComponentProps {
  csrfToken: string;
}

export default function SignInForm({ csrfToken }: ComponentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const res = await signInAction(formData);
      if (!res.ok) {
        if (res.code === 500 && res.data === "db_not_ready") {
          setError("Database not initialized. Run db:push and seed.");
        } else if (res.code === 500) {
          setError("Server error. Please try again.");
        } else {
          setError("Invalid email or password");
        }
        return;
      }
      const returnUrl = searchParams.get("returnUrl") || "/dashboard";
      router.push(returnUrl);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <div>
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
          id="email"
          name="email"
          type="email"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
        />
      </div>
      {error ? <div className="text-sm text-destructive">{error}</div> : null}
      <button
        type="submit"
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        disabled={isPending}
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
      <div className="text-center text-sm text-muted-foreground">
        Need an account?{" "}
        <a className="text-primary underline" href="/sign-up">
          Create admin
        </a>
      </div>
    </form>
  );
}
