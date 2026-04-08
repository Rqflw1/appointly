"use client";

import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { Tabs, TabsList, TabsTrigger } from "@/app/_shadcn/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { types } from "@/app/_lib/constants/general";
import { EmailSettingsDict } from "@/app/_lib/types/emailSettings";
import EmailSettingsByTypeTab from "./EmailSettingsByTypeTab";
import SmtpSettingsTab from "./SmtpSettingsTab";
import { Company } from "@/app/_prisma/browser";

interface ComponentProps {
  company: Company;
  smtpPassword: string;
  emailSettingsDict: EmailSettingsDict;
}

export default function EmailSettings({
  company,
  smtpPassword,
  emailSettingsDict
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  return (
    <div>
      <Tabs defaultValue="smtpSettings">
        <TabsList>
          <TabsTrigger value="smtpSettings">{dict.labels.smtp}</TabsTrigger>
          {types.map((type, key) => (
            <TabsTrigger key={key} value={type}>
              {dict.documentType[type]}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="smtpSettings">
          <SmtpSettingsTab company={company} smtpPassword={smtpPassword} />
        </TabsContent>
        {types.map((type, key) => (
          <TabsContent key={key} value={type}>
            <EmailSettingsByTypeTab
              type={type}
              settings={emailSettingsDict[type]}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
