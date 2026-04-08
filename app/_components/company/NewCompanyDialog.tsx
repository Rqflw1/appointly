"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { Plus } from "lucide-react";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import {
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  DEFAULT_DUE_PERIOD,
  DEFAULT_LANGUAGE,
  DEFAULT_LATE_FEE_RATE,
  DEFAULT_VAT_RATE,
  toastHelper
} from "@/app/_lib/constants/general";
import { CreateCompanyModel } from "@/app/_lib/types/company";
import { createCompanyAction } from "@/app/_lib/serverActions/company";
import { Country } from "@/app/_lib/constants/countries";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";
import GeneralInfoForm from "./GeneralInfoForm";

interface ComponentProps {
  isOpen: boolean;
}

export default function NewCompanyDialog({
  isOpen: isOpenProp
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [isOpen, setIsOpen] = useState(isOpenProp);
  const { isLoading, setIsLoading } = useFormState();

  const [isIndividual, setIsIndividual] = useState(false);
  const [country, setCountry] = useInputValue<Country>(DEFAULT_COUNTRY);
  const [name, setName, nameError, setNameError] = useInputValue("");
  const [regNum, setRegNum] = useInputValue("");
  const [vatNum, setVatNum] = useInputValue("");
  const [address, setAddress] = useInputValue("");
  const [email, setEmail] = useInputValue("");
  const [url, setUrl] = useInputValue("");
  const [phone, setPhone] = useInputValue("");
  const [note, setNote] = useInputValue("");
  const [comment, setComment] = useInputValue("");

  async function createRecord(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    if (!name) setNameError(dict.errors.nameIsRequired);

    if (!name) return;

    const model: CreateCompanyModel = {
      isIndividual,
      country: country.iso2,
      name,
      regNum,
      vatNum,
      address,
      email,
      url,
      phone,
      note,
      comment,
      language: DEFAULT_LANGUAGE,
      currency: DEFAULT_CURRENCY,
      duePeriod: DEFAULT_DUE_PERIOD,
      lateFeeRate: DEFAULT_LATE_FEE_RATE,
      vatRate: DEFAULT_VAT_RATE
    };

    setIsLoading(true);
    const res = await createCompanyAction(model);
    setIsLoading(false);

    if (res.ok) {
      toastHelper.success(dict);
      setIsOpen(false);
    } else toastHelper.error(dict);
  }

  useEffect(() => {
    setIsIndividual(false);
    setCountry(DEFAULT_COUNTRY);
    setName("");
    setRegNum("");
    setVatNum("");
    setAddress("");
    setEmail("");
    setUrl("");
    setPhone("");
    setNote("");
    setComment("");
  }, [isOpen]);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        <Plus />
        <span>{dict.labels.addCompany}</span>
      </Button>
      <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dict.labels.addCompany}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto">
            <GeneralInfoForm
              isIndividualInput={[isIndividual, setIsIndividual]}
              countryInput={[country, setCountry]}
              nameInput={[name, setName, nameError]}
              regNumInput={[regNum, setRegNum]}
              vatNumInput={[vatNum, setVatNum]}
              addressInput={[address, setAddress]}
              emailInput={[email, setEmail]}
              urlInput={[url, setUrl]}
              phoneInput={[phone, setPhone]}
              noteInput={[note, setNote]}
              commentInput={[comment, setComment]}
            />
          </div>
          <DialogFooter>
            <Button
              disabled={isLoading}
              isLoading={isLoading}
              type="submit"
              className="w-36"
              onClick={createRecord}
            >
              {dict.labels.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
