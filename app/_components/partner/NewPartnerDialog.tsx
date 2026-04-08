"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { Plus } from "lucide-react";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import { DEFAULT_COUNTRY, toastHelper } from "@/app/_lib/constants/general";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/app/_shadcn/components/ui/tabs";
import GeneralInfoForm from "../company/GeneralInfoForm";
import { CreateCompanyModel } from "@/app/_lib/types/company";
import { createPartnersAction } from "@/app/_lib/serverActions/company";
import PaymentMethodsTab from "./PaymentMethodsTab";
import { CreatePaymentMethodModelRow } from "@/app/_lib/types/paymentMethod";
import { Language } from "@/app/_prisma/enums";
import { round } from "@/app/_lib/functions/general";
import SettingsTab from "./SettingsTab";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";

export default function NewPartnerDialog() {
  const { dict } = useContext(LocaleContext);

  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, setIsLoading } = useFormState();

  const [isIndividual, setIsIndividual] = useState(false);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [name, setName, nameError, setNameError] = useInputValue("");
  const [regNum, setRegNum] = useState("");
  const [vatNum, setVatNum] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [comment, setComment] = useState("");
  const [language, setLanguage] = useState<Language | null>(null);
  const [currency, setCurrency] = useState("");
  const [duePeriod, setDuePeriod] = useState("");
  const [lateFeeRate, setLateFeeRate] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<
    CreatePaymentMethodModelRow[]
  >([]);

  async function createRecord(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    if (!name) setNameError(dict.errors.nameIsRequired);

    if (!name) return;

    const model: CreateCompanyModel = {
      country: country.iso2,
      isIndividual,
      name,
      regNum,
      vatNum,
      address,
      email,
      url,
      phone,
      note,
      comment,
      language,
      currency,
      duePeriod: round(parseFloat(duePeriod), 0),
      lateFeeRate: round(parseFloat(lateFeeRate) * 0.01, 4),
      vatRate: NaN,
      paymentMethods,
      isPartner: true
    };

    setIsLoading(true);
    const res = await createPartnersAction([model]);
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
    setLanguage(null);
    setCurrency("");
    setDuePeriod("");
    setLateFeeRate("");
    setPaymentMethods([]);
  }, [isOpen]);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        <Plus />
        <span>{dict.labels.addPartner}</span>
      </Button>
      <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dict.labels.addPartner}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="general" className="overflow-auto">
            <TabsList>
              <TabsTrigger value="general">{dict.labels.general}</TabsTrigger>
              <TabsTrigger value="paymentMethods">
                {dict.labels.paymentMethods}
              </TabsTrigger>
              <TabsTrigger value="settings">{dict.labels.settings}</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="overflow-auto">
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
            </TabsContent>
            <TabsContent value="paymentMethods" className="overflow-auto">
              <PaymentMethodsTab
                paymentMethods={paymentMethods}
                setPaymentMethods={setPaymentMethods}
              />
            </TabsContent>
            <TabsContent value="settings" className="overflow-auto">
              <SettingsTab
                languageInput={[language, setLanguage]}
                currencyInput={[currency, setCurrency]}
                duePeriodInput={[duePeriod, setDuePeriod]}
                lateFeeRateInput={[lateFeeRate, setLateFeeRate]}
              />
            </TabsContent>
          </Tabs>
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
