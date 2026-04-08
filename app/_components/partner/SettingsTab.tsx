"use client";

import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { SetState } from "@/app/_lib/types/general";
import { Language } from "@/app/_prisma/enums";
import { Label } from "@/app/_shadcn/components/ui/label";
import DropdownInput from "../input/DropdownInput";
import { currencies } from "@/app/_lib/constants/currencies";
import {
  compareNumbers,
  toFixed,
  toString
} from "@/app/_lib/functions/general";
import { languages } from "@/app/_lib/constants/general";
import InputWithDropdown from "../input/InputWithDropdown";

interface ComponentProps {
  languageInput: [Language | null, SetState<Language | null>];
  currencyInput: [string, SetState<string>];
  duePeriodInput: [string, SetState<string>];
  lateFeeRateInput: [string, SetState<string>];
}

export default function SettingsTab({
  languageInput: [language, setLanguage],
  currencyInput: [currency, setCurrency],
  duePeriodInput: [duePeriod, setDuePeriod],
  lateFeeRateInput: [lateFeeRate, setLateFeeRate]
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  return (
    <div className="p-6 flex flex-col gap-6 bg-secondary rounded-3xl">
      <div className="font-semibold text-foreground">
        {dict.labels.companySettings}
      </div>
      <div>
        <Label htmlFor="language">{dict.labels.language}</Label>
        <DropdownInput
          className="mt-2 w-full"
          selected={language}
          options={[null, ...languages]}
          renderOption={(option) =>
            option ? dict.language[option] : dict.labels.none
          }
          onChange={(option) => setLanguage(option)}
        />
      </div>
      <div>
        <Label htmlFor="currency">{dict.labels.currency}</Label>
        <DropdownInput
          className="mt-2 w-full"
          selected={currency}
          options={["", ...currencies]}
          renderSelected={(option) => option || dict.labels.select}
          renderOption={(option) => option || dict.labels.none}
          onChange={(option) => setCurrency(option)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duePeriod">{dict.labels.duePeriod}</Label>
          <InputWithDropdown
            type="number"
            className="w-full mt-2"
            value={duePeriod}
            options={[NaN, 0, 1, 5, 7, 10, 14, 21, 30]}
            renderValue={(value) => {
              const number = parseFloat(value);
              if (isNaN(number)) return dict.labels.none;
              if (number === 0) return dict.labels.sameDay;
              return `${value} ${dict.labels.days}`;
            }}
            renderOption={(option) => {
              if (isNaN(option)) return dict.labels.none;
              if (option === 0) return dict.labels.sameDay;
              return `${option} ${dict.labels.days}`;
            }}
            getIsSelected={(value, _, option) =>
              compareNumbers(parseFloat(value), option)
            }
            onChange={(value) => setDuePeriod(value)}
            onSelect={(option) => setDuePeriod(toString(option))}
            onClose={() => setDuePeriod(toFixed(parseFloat(duePeriod), 0))}
          />
        </div>
        <div>
          <Label htmlFor="lateFeeRate">{dict.labels.lateFeeRate}</Label>
          <InputWithDropdown
            type="number"
            className="w-full mt-2"
            value={lateFeeRate}
            options={[NaN, 0, 0.05, 0.1, 0.2, 0.3, 0.5]}
            renderValue={(value) => {
              const number = parseFloat(value);
              if (isNaN(number)) return dict.labels.none;
              return `${value} %`;
            }}
            renderOption={(option) => {
              if (isNaN(option)) return dict.labels.none;
              return `${option} %`;
            }}
            getIsSelected={(value, _, option) =>
              compareNumbers(parseFloat(value), option)
            }
            onChange={(value) => setLateFeeRate(value)}
            onSelect={(option) => setLateFeeRate(toString(option))}
            onClose={() => setLateFeeRate(toFixed(parseFloat(lateFeeRate), 2))}
          />
        </div>
      </div>
    </div>
  );
}
