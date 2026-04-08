"use client";

import { Company, Unit } from "@/app/_prisma/browser";
import GeneralDocumentSettingsForm from "./GeneralDocumentSettingsForm";
import UnitsTable from "../unit/UnitsTable";

interface ComponentProps {
  company: Company;
  units: Unit[];
}

export default function GeneralDocumentSettingsTab({
  company,
  units
}: ComponentProps) {
  return (
    <div>
      <GeneralDocumentSettingsForm company={company} />
      <div className="mt-16">
        <UnitsTable units={units} />
      </div>
    </div>
  );
}
