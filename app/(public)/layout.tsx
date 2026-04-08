import { ReactNode } from "react";
import LocaleProvider from "../_components/context/LocaleProvider";
import Header from "../_components/general/Header";
import { getDictionary } from "../_lib/functions/general";
import { DEFAULT_LANGUAGE } from "../_lib/constants/general";
import { publicRoute } from "../_lib/serverFunctions/auth";

interface ComponentProps {
  children: ReactNode;
}

export default publicRoute(Layout);
async function Layout({ children }: ComponentProps) {
  const language = DEFAULT_LANGUAGE;
  const dict = getDictionary(language);

  return (
    <LocaleProvider language={language}>
      <Header dict={dict} />
      {children}
    </LocaleProvider>
  );
}
