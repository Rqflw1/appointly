"use client";

import VatInputWithCheck from "../input/VatInputWithCheck";
import { Label } from "@/app/_shadcn/components/ui/label";
import { useContext } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { Input } from "@/app/_shadcn/components/ui/input";
import FormError from "../general/FormError";
import { Textarea } from "@/app/_shadcn/components/ui/textarea";
import { SetState } from "@/app/_lib/types/general";
import { Country } from "@/app/_lib/constants/countries";
import CountryInput from "../input/CountryInput";
import PartnerInput from "../input/PartnerInput";
import { CompanyWithMethods } from "@/app/_lib/types/company";
import {
  RadioGroup,
  RadioGroupItem
} from "@/app/_shadcn/components/ui/radio-group";

interface ComponentProps {
  isPartnerInput?: boolean;
  hideComment?: boolean;
  onPartnerSelect?: (option: CompanyWithMethods) => void;
  //
  isIndividualInput: [boolean, SetState<boolean>];
  countryInput: [Country, SetState<Country>];
  nameInput: [string, SetState<string>, string?];
  regNumInput: [string, SetState<string>];
  vatNumInput: [string, SetState<string>];
  addressInput: [string, SetState<string>];
  emailInput: [string, SetState<string>];
  urlInput: [string, SetState<string>];
  phoneInput: [string, SetState<string>];
  noteInput: [string, SetState<string>];
  commentInput: [string, SetState<string>];
}

export default function GeneralInfoForm({
  isPartnerInput,
  hideComment,
  onPartnerSelect = () => {},
  isIndividualInput: [isIndividual, setIsIndividual],
  countryInput: [country, setCountry],
  nameInput: [name, setName, nameError],
  regNumInput: [regNum, setRegNum],
  vatNumInput: [vatNum, setVatNum],
  addressInput: [address, setAddress],
  emailInput: [email, setEmail],
  urlInput: [url, setUrl],
  phoneInput: [phone, setPhone],
  noteInput: [note, setNote],
  commentInput: [comment, setComment]
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  return (
    <div>
      <div className="p-6 flex flex-col gap-6 bg-secondary rounded-3xl">
        <div className="font-semibold text-foreground">
          {dict.labels.companyInformation}
        </div>
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
              <Label htmlFor="isIndividual-false">{dict.labels.business}</Label>
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
        <div>
          <Label htmlFor="country">{dict.labels.country}</Label>
          <CountryInput
            className="mt-2"
            selected={country}
            onSelect={setCountry}
          />
        </div>
        <div>
          <Label htmlFor="name">
            {isIndividual ? dict.labels.name : dict.labels.itemName}
          </Label>
          {isPartnerInput && (
            <PartnerInput
              className="mt-2"
              value={name}
              onChange={(value) => setName(value)}
              onSelect={onPartnerSelect}
              aria-invalid={!!nameError}
            />
          )}
          {!isPartnerInput && (
            <Input
              id="name"
              type="text"
              className="mt-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!nameError}
            />
          )}
          {nameError && <FormError error={nameError} className="mt-1" />}
        </div>
        <div className="grid grid-cols-2 gap-4">
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
            <Label htmlFor="vatNum">{dict.labels.vatNumber}</Label>
            <div className="mt-2">
              <VatInputWithCheck value={vatNum} onChange={setVatNum} />
            </div>
          </div>
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
          <Label htmlFor="note">{dict.labels.note}</Label>
          <Textarea
            id="note"
            className="mt-2 h-16"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        {!hideComment && (
          <div>
            <Label htmlFor="comment">{dict.labels.comment}</Label>
            <Input
              id="comment"
              type="text"
              className="mt-2"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        )}
      </div>
      <div className="mt-6 p-6 flex flex-col gap-6 bg-secondary rounded-3xl">
        <div className="font-semibold text-foreground">
          {dict.labels.contactInformation}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="email">{dict.labels.email}</Label>
            <Input
              id="email"
              type="text"
              className="mt-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
        <div>
          <Label htmlFor="url">{dict.labels.homepageUrl}</Label>
          <Input
            id="url"
            type="text"
            className="mt-2"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
