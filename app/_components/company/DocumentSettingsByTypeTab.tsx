"use client";

import { Label } from "@/app/_shadcn/components/ui/label";
import { MouseEvent, useContext, useEffect } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import DropdownInput from "../input/DropdownInput";
import { round, toFixed } from "@/app/_lib/functions/general";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { toastHelper } from "@/app/_lib/constants/general";
import { Button } from "@/app/_shadcn/components/ui/button";
import { Input } from "@/app/_shadcn/components/ui/input";
import NumberInput from "../input/NumberInput";
import { Textarea } from "@/app/_shadcn/components/ui/textarea";
import { CreateDocumentSettingsModel } from "@/app/_lib/types/documentSettings";
import { upsertDocumentSettingsAction } from "@/app/_lib/serverActions/documentSettings";
import FormError from "../general/FormError";
import { formatDocNum } from "@/app/_lib/functions/documentSettings";
import { docIndexRegex, docIndexRegexG } from "@/app/_lib/validation/general";
import {
  DocumentSettings,
  DocumentType,
  IndexRefreshRate
} from "@/app/_prisma/browser";

const minIndexLengthOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const indexRefreshRates = Object.values(IndexRefreshRate);

interface ComponentProps {
  type: DocumentType;
  settings: DocumentSettings | null;
}

export default function DocumentSettingsByTypeTab({
  type,
  settings
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const { isLoading, setIsLoading } = useFormState();

  const [docNum, setDocNum] = useInputValue("");
  const [indexRefreshRate, setIndexRefreshRate] =
    useInputValue<IndexRefreshRate>(IndexRefreshRate.YEAR);
  const [minIndexLength, setMinIndexLength] = useInputValue(1);
  const [index, setIndex, indexError, setIndexError] = useInputValue("1");
  const [note, setNote] = useInputValue("");

  async function upsertRecord(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const indexNum = round(parseFloat(index), 0);

    if (isNaN(indexNum) || indexNum < 0)
      setIndexError(dict.errors.currentIndexMustBe);

    if (isNaN(indexNum) || indexNum < 0) return;

    const model: CreateDocumentSettingsModel = {
      type,
      docNum,
      indexRefreshRate,
      index: indexNum,
      note
    };

    setIsLoading(true);
    const res = await upsertDocumentSettingsAction(model);
    setIsLoading(false);

    if (res.ok) toastHelper.success(dict);
    else toastHelper.error(dict);
  }

  useEffect(() => {
    setDocNum(settings?.docNum || "");
    setIndexRefreshRate(settings?.indexRefreshRate || IndexRefreshRate.YEAR);
    setIndex(toFixed(settings?.index || 1, 0));
    setNote(settings?.note || "");

    let minIndexLength = 1;
    if (settings?.docNum) {
      const matches = [...settings.docNum.matchAll(docIndexRegexG)];
      matches.forEach((match, key) => {
        if (key !== 0) return;
        let indexLength = parseInt(match[1]);
        if (minIndexLengthOptions.includes(indexLength))
          minIndexLength = indexLength;
      });
    }
    setMinIndexLength(minIndexLength);
  }, [settings]);

  return (
    <form>
      <div className="p-8 bg-secondary rounded-3xl">
        <div className="text-xl font-semibold text-foreground">
          {`${dict.documentType[type]} ${dict.labels.settingsLowercase}`}
        </div>
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div>
            <Label htmlFor="docNum">{dict.labels.documentNumberFormat}</Label>
            <Input
              id="docNum"
              type="text"
              className="mt-2"
              value={docNum}
              onChange={(e) => setDocNum(e.target.value)}
              onBlur={() => {
                let newDocNum = docNum;
                const matches = [...docNum.matchAll(docIndexRegexG)];
                matches.forEach((match, key) => {
                  if (key !== 0) return;
                  let indexLength = parseInt(match[1]);
                  if (minIndexLengthOptions.includes(indexLength))
                    setMinIndexLength(indexLength);
                  else
                    newDocNum = newDocNum.replace(
                      docIndexRegex,
                      `{N${minIndexLength}}`
                    );
                });
                setDocNum(newDocNum);
              }}
            />
            <div className="mt-1 text-xs text-secondary-foreground">
              <span className="font-semibold">{`${dict.labels.preview}:`}</span>
              <span className="ml-1">{formatDocNum(docNum, 1)}</span>
            </div>
          </div>
          <div>
            <Label htmlFor="minIndexLength">{dict.labels.minIndexLength}</Label>
            <DropdownInput
              className="mt-2 w-full"
              selected={minIndexLength}
              options={minIndexLengthOptions}
              onChange={(option) => {
                if (!option) return;
                setMinIndexLength(option);
                setDocNum(docNum.replace(/\{N(\d+)\}/, `{N${option}}`));
              }}
            />
          </div>
          <div>
            <Label htmlFor="index">{dict.labels.currentIndex}</Label>
            <NumberInput
              id="index"
              className="mt-2"
              value={index}
              onChange={(value) => setIndex(value)}
              onBlur={() => setIndex(toFixed(parseFloat(index), 0))}
              aria-invalid={!!indexError}
            />
            <FormError error={indexError} className="mt-1" />
          </div>
        </div>
        <div className="mt-6">
          <Label htmlFor="note">{dict.labels.note}</Label>
          <Textarea
            id="note"
            className="mt-2 h-32"
            placeholder={dict.labels.note}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button
          disabled={isLoading}
          isLoading={isLoading}
          type="submit"
          className="w-48"
          onClick={upsertRecord}
        >
          {dict.labels.save}
        </Button>
      </div>
    </form>
  );
}
