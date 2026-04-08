"use client";

import { Label } from "@/app/_shadcn/components/ui/label";
import { MouseEvent, useContext, useEffect } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import DropdownInput from "../input/DropdownInput";
import { currencies } from "@/app/_lib/constants/currencies";
import {
  compareNumbers,
  round,
  toFixed,
  toString
} from "@/app/_lib/functions/general";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import {
  DEFAULT_CURRENCY,
  DEFAULT_DUE_PERIOD,
  DEFAULT_LANGUAGE,
  DEFAULT_LATE_FEE_RATE,
  languages,
  toastHelper
} from "@/app/_lib/constants/general";
import { CreateCompanyModel } from "@/app/_lib/types/company";
import { updateCompanyAction } from "@/app/_lib/serverActions/company";
import { Button } from "@/app/_shadcn/components/ui/button";
import InputWithDropdown from "../input/InputWithDropdown";
import { Company, Language } from "@/app/_prisma/browser";

interface ComponentProps {
  company: Company;
}

export default function GeneralDocumentSettingsForm({
  company
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const { isLoading, setIsLoading } = useFormState();

  const [language, setLanguage] = useInputValue<Language>(DEFAULT_LANGUAGE);
  const [currency, setCurrency] = useInputValue("");
  const [duePeriod, setDuePeriod] = useInputValue("");
  const [lateFeeRate, setLateFeeRate] = useInputValue("");
  const [vatRate, setVatRate] = useInputValue("");

  async function updateRecord(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const model: CreateCompanyModel = {
      isIndividual: company.isIndividual,
      country: company.country,
      name: company.name,
      regNum: company.regNum,
      vatNum: company.vatNum,
      address: company.address,
      email: company.email,
      url: company.url,
      phone: company.phone,
      note: company.note,
      comment: company.comment,
      language,
      currency,
      duePeriod: round(parseFloat(duePeriod), 0),
      lateFeeRate: round(parseFloat(lateFeeRate) * 0.01, 4),
      vatRate: round(parseFloat(vatRate) * 0.01, 4)
    };

    setIsLoading(true);
    const res = await updateCompanyAction(company.id, model);
    setIsLoading(false);

    if (res.ok) toastHelper.success(dict);
    else toastHelper.error(dict);
  }

  useEffect(() => {
    setLanguage(company.language || DEFAULT_LANGUAGE);
    setCurrency(company.currency || DEFAULT_CURRENCY);
    setDuePeriod(toFixed(company.duePeriod ?? DEFAULT_DUE_PERIOD, 0));
    setLateFeeRate(
      toFixed((company.lateFeeRate ?? DEFAULT_LATE_FEE_RATE) * 100, 2)
    );
    setVatRate(toFixed((company.vatRate ?? NaN) * 100, 2));
  }, [company]);

  return (
    <form>
      <div className="p-8 bg-secondary rounded-3xl">
        <div className="text-xl font-semibold text-foreground">
          {dict.labels.generalSettings}
        </div>
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div>
            <Label htmlFor="language">{dict.labels.language}</Label>
            <DropdownInput
              className="mt-2 w-full"
              selected={language}
              options={languages}
              renderOption={(option) => dict.language[option]}
              onChange={(option) => option && setLanguage(option)}
            />
          </div>
          <div>
            <Label htmlFor="duePeriod">{dict.labels.duePeriod}</Label>
            <InputWithDropdown
              type="number"
              className="w-full mt-2"
              value={duePeriod}
              options={[0, 1, 5, 7, 10, 14, 21, 30]}
              renderValue={(value) => {
                const number = parseFloat(value);
                if (isNaN(number)) return "";
                if (number === 0) return dict.labels.sameDay;
                return `${value} ${dict.labels.days}`;
              }}
              renderOption={(option) => {
                if (option === 0) return dict.labels.sameDay;
                return `${option} ${dict.labels.days}`;
              }}
              getIsSelected={(value, _, option) =>
                compareNumbers(parseFloat(value), option)
              }
              onChange={(value) => setDuePeriod(value)}
              onSelect={(option) => setDuePeriod(toString(option))}
              onClose={() =>
                setDuePeriod(toFixed(parseFloat(duePeriod) || 0, 0))
              }
            />
          </div>
          <div>
            <Label htmlFor="vatRate">{dict.labels.vatRate}</Label>
            <InputWithDropdown
              type="number"
              className="w-full mt-2"
              value={vatRate}
              options={[NaN, 0, 5, 12, 21]}
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
              onChange={(value) => setVatRate(value)}
              onSelect={(option) => setVatRate(toString(option))}
              onClose={() => setVatRate(toFixed(parseFloat(vatRate), 2))}
            />
          </div>
          <div>
            <Label htmlFor="currency">{dict.labels.currency}</Label>
            <DropdownInput
              className="mt-2 w-full"
              selected={currency}
              options={currencies}
              onChange={(option) => option && setCurrency(option)}
            />
          </div>
          <div>
            <Label htmlFor="lateFeeRate">{dict.labels.lateFeeRate}</Label>
            <InputWithDropdown
              type="number"
              className="w-full mt-2"
              value={lateFeeRate}
              options={[0, 0.05, 0.1, 0.2, 0.3, 0.5]}
              renderValue={(value) => {
                const number = parseFloat(value);
                if (isNaN(number)) return "";
                return `${value} %`;
              }}
              renderOption={(option) => `${option} %`}
              getIsSelected={(value, _, option) =>
                compareNumbers(parseFloat(value), option)
              }
              onChange={(value) => setLateFeeRate(value)}
              onSelect={(option) => setLateFeeRate(toString(option))}
              onClose={() =>
                setLateFeeRate(toFixed(parseFloat(lateFeeRate) || 0, 2))
              }
            />
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button
          disabled={isLoading}
          isLoading={isLoading}
          type="submit"
          className="w-48"
          onClick={updateRecord}
        >
          {dict.labels.save}
        </Button>
      </div>
    </form>
  );
}
