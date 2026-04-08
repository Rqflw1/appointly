"use client";

import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { Tabs, TabsList, TabsTrigger } from "@/app/_shadcn/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import GeneralDocumentSettingsTab from "./GeneralDocumentSettingsTab";
import DocumentSettingsByTypeTab from "./DocumentSettingsByTypeTab";
import { DocumentSettingsDict } from "@/app/_lib/types/documentSettings";
import { types } from "@/app/_lib/constants/general";
import { Company, Unit } from "@/app/_prisma/browser";

interface ComponentProps {
  company: Company;
  documentSettingsDict: DocumentSettingsDict;
  units: Unit[];
}

export default function DocumentSettings({
  company,
  documentSettingsDict,
  units
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  return (
    <div>
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">{dict.labels.general}</TabsTrigger>
          {types.map((type, key) => (
            <TabsTrigger key={key} value={type}>
              {dict.documentType[type]}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="general">
          <GeneralDocumentSettingsTab company={company} units={units} />
        </TabsContent>
        {types.map((type, key) => (
          <TabsContent key={key} value={type}>
            <DocumentSettingsByTypeTab
              type={type}
              settings={documentSettingsDict[type]}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
