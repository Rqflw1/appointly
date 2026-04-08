"use client";

import { useContext, useState } from "react";
import { Input } from "@/app/_shadcn/components/ui/input";
import { CheckCircle, XCircle, LoaderCircle } from "lucide-react";
import { getViesDataAction } from "@/app/_lib/serverActions/vies";
import { Button } from "@/app/_shadcn/components/ui/button";
import { LocaleContext } from "../context/LocaleProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/app/_shadcn/components/ui/tooltip";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

enum VatCheckState {
  IDLE = "IDLE",
  LOADING = "LOADING",
  VALID = "VALID",
  ERROR = "ERROR"
}

export default function VatInputWithCheck({ value, onChange }: Props) {
  const { dict } = useContext(LocaleContext);

  const [status, setStatus] = useState<VatCheckState>(VatCheckState.IDLE);

  async function checkVat() {
    if (status === VatCheckState.LOADING) return;
    if (!value) return setStatus(VatCheckState.ERROR);

    setStatus(VatCheckState.LOADING);

    const res = await getViesDataAction(value);

    if (res.ok) {
      setStatus(VatCheckState.VALID);
      onChange(`${res.data.countryCode}${res.data.vatNumber}`);
    } else setStatus(VatCheckState.ERROR);
  }

  return (
    <div>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setStatus(VatCheckState.IDLE);
          }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {status === VatCheckState.LOADING && (
            <LoaderCircle className="size-4 animate-spin text-secondary-foreground" />
          )}
          {status === VatCheckState.VALID && (
            <Tooltip>
              <TooltipTrigger>
                <CheckCircle className="w-4 h-4 text-green-600 cursor-default" />
              </TooltipTrigger>
              <TooltipContent>asfa{dict.labels.companyIsVat}</TooltipContent>
            </Tooltip>
          )}
          {status === VatCheckState.ERROR && (
            <Tooltip>
              <TooltipTrigger>
                <XCircle className="w-4 h-4 text-red-600 cursor-default" />
              </TooltipTrigger>
              <TooltipContent>{dict.labels.cantDetermineVat}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      <div className="mt-1 pr-4 flex justify-end">
        <Button
          disabled={!value}
          type="submit"
          variant="link"
          size="link"
          onClick={checkVat}
        >
          {dict.labels.check}
        </Button>
      </div>
    </div>
  );
}
