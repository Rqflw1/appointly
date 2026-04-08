"use client";

import VatInputWithCheck from "../input/VatInputWithCheck";
import { Input } from "@/app/_shadcn/components/ui/input";
import FormError from "../general/FormError";
import { Label } from "@/app/_shadcn/components/ui/label";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { Button } from "@/app/_shadcn/components/ui/button";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import { updateCompanyAction } from "@/app/_lib/serverActions/company";
import { z } from "zod";
import { DEFAULT_COUNTRY, toastHelper } from "@/app/_lib/constants/general";
import { CreateCompanyModel } from "@/app/_lib/types/company";
import CountryInput from "../input/CountryInput";
import { countries } from "@/app/_lib/constants/countries";
import { EmailSchema } from "@/app/_lib/validation/general";
import { Company } from "@/app/_prisma/browser";
import {
  RadioGroup,
  RadioGroupItem
} from "@/app/_shadcn/components/ui/radio-group";

interface ComponentProps {
  company: Company;
}

export default function ProfileForm({ company }: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const { isLoading, setIsLoading } = useFormState();

  const [isIndividual, setIsIndividual] = useState(false);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [name, setName, nameError, setNameError] = useInputValue("");
  const [regNum, setRegNum] = useState("");
  const [vatNum, setVatNum] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail, emailError, setEmailError] = useInputValue("");
  const [url, setUrl, urlError, setUrlError] = useInputValue("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  async function updateRecord(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const zResEmail = EmailSchema.safeParse(email);
    const zResUrl = z.string().url().safeParse(url);

    if (!name) setNameError(dict.errors.nameIsRequired);
    if (email && !zResEmail.success) setEmailError(dict.errors.invalidEmail);
    if (url && !zResUrl.success) setUrlError(dict.errors.invalidUrl);

    if (!name) return;
    if (email && !zResEmail.success) return;
    if (url && !zResUrl.success) return;

    const model: CreateCompanyModel = {
      isIndividual,
      country: country.iso2,
      name,
      regNum,
      vatNum,
      address,
      email: zResEmail.data || "",
      url: zResUrl.data || "",
      phone,
      note,
      comment: "",
      language: company.language,
      currency: company.currency,
      duePeriod: company.duePeriod ?? NaN,
      lateFeeRate: company.lateFeeRate ?? NaN,
      vatRate: company.vatRate ?? NaN
    };

    setIsLoading(true);
    const res = await updateCompanyAction(company.id, model);
    setIsLoading(false);

    if (res.ok) toastHelper.success(dict);
    else toastHelper.error(dict);
  }

  useEffect(() => {
    setIsIndividual(company.isIndividual);
    const country = countries.find(({ iso2 }) => iso2 === company.country);
    setCountry(country || DEFAULT_COUNTRY);
    setName(company.name);
    setRegNum(company.regNum);
    setVatNum(company.vatNum);
    setAddress(company.address);
    setEmail(company.email);
    setUrl(company.url);
    setPhone(company.phone);
    setNote(company.note);
  }, [company]);

  return (
    <form>
      <div className="p-8 bg-secondary rounded-3xl">
        <div className="text-xl font-semibold text-foreground">
          {dict.labels.companyInformation}
        </div>
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div>
            <RadioGroup
              value={isIndividual ? "isIndividual-true" : "isIndividual-false"}
              className="grid-cols-2"
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem
                  value="isIndividual-false"
                  id="isIndividual-false"
                  onClick={() => setIsIndividual(false)}
                />
                <Label htmlFor="isIndividual-false">
                  {dict.labels.business}
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem
                  value="isIndividual-true"
                  id="isIndividual-true"
                  onClick={() => setIsIndividual(true)}
                />
                <Label htmlFor="isIndividual-true">
                  {dict.labels.individual}
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div />
          <div />
          <div>
            <Label htmlFor="country">{dict.labels.country}</Label>
            <CountryInput
              className="mt-2"
              selected={country}
              onSelect={setCountry}
            />
          </div>
          <div>
            <Label htmlFor="regNum">
              {isIndividual ? dict.labels.idNumber : dict.labels.regNumber}
            </Label>
            <Input
              id="regNum"
              type="text"
              className="mt-2"
              value={regNum}
              onChange={(e) => setRegNum(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="address">{dict.labels.address}</Label>
            <Input
              id="address"
              type="text"
              className="mt-2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="name">{dict.labels.companyName}</Label>
            <Input
              id="name"
              type="text"
              className="mt-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!nameError}
            />
            <FormError error={nameError} className="mt-1" />
          </div>
        <div>
          <Label htmlFor="vatNum">{dict.labels.vatNumber}</Label>
          <div className="mt-2">
            <VatInputWithCheck
              value={vatNum}
              onChange={setVatNum}
            />
          </div>
        </div>
          <div>
            <Label htmlFor="note">{dict.labels.note}</Label>
            <Input
              id="note"
              type="text"
              className="mt-2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="mt-6 p-8 bg-secondary rounded-3xl">
        <div className="text-xl font-semibold text-foreground">
          {dict.labels.contactInformation}
        </div>
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div>
            <Label htmlFor="email">{dict.labels.email}</Label>
            <Input
              id="email"
              type="text"
              className="mt-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!emailError}
            />
            <FormError error={emailError} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="url">{dict.labels.homepageUrl}</Label>
            <Input
              id="url"
              type="text"
              className="mt-2"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              aria-invalid={!!urlError}
            />
            <FormError error={urlError} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="phone">{dict.labels.phone}</Label>
            <Input
              id="phone"
              type="text"
              className="mt-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
