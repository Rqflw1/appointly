import "server-only";

import { cookies } from "next/headers";
import { Language } from "@/app/_prisma/enums";
import { DEFAULT_LANGUAGE } from "@/app/_lib/constants/general";

export async function getActiveLanguage(fallback?: Language) {
  const store = await cookies();
  const cookieLang = store.get("language")?.value as Language | undefined;
  return cookieLang || fallback || DEFAULT_LANGUAGE;
}
