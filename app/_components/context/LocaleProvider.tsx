"use client";

import { DEFAULT_LANGUAGE } from "@/app/_lib/constants/general";
import { getDictionary } from "@/app/_lib/functions/general";
import { Dictionary } from "@/app/_lib/types/general";
import { Language } from "@/app/_prisma/enums";
import { ReactNode, createContext } from "react";

interface LocaleContext {
  language: Language;
  dict: Dictionary;
}

export const LocaleContext = createContext<LocaleContext>({
  language: DEFAULT_LANGUAGE,
  dict: getDictionary(DEFAULT_LANGUAGE)
});

interface ComponentProps {
  children: ReactNode;
  language: Language;
}

export default function LocaleProvider({ children, language }: ComponentProps) {
  const dict = getDictionary(language);

  return <LocaleContext value={{ language, dict }}>{children}</LocaleContext>;
}
