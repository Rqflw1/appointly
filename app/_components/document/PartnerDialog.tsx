"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import {
  DEFAULT_COUNTRY,
  DEFAULT_LANGUAGE
} from "@/app/_lib/constants/general";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/app/_shadcn/components/ui/tabs";
import {
  CompanyWithMethods,
  CreateCompanyModel
} from "@/app/_lib/types/company";
import { CreatePaymentMethodModelRow } from "@/app/_lib/types/paymentMethod";
import { countries } from "@/app/_lib/constants/countries";
import { SetState } from "@/app/_lib/types/general";
import PaymentMethodsTab from "../partner/PaymentMethodsTab";
import { Checkbox } from "@/app/_shadcn/components/ui/checkbox";
import { Label } from "@/app/_shadcn/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";
import GeneralInfoForm from "../company/GeneralInfoForm";
import { Language } from "@/app/_prisma/enums";
import { Company } from "@/app/_prisma/browser";
import { mapPaymentMethodsToCreatePaymentMethodModelRows } from "@/app/_lib/functions/paymentMethod";

interface BaseComponentProps {
  isOpen: boolean;
  setIsOpen: SetState<boolean>;
  partnerInput: [CreateCompanyModel, SetState<CreateCompanyModel>];
}

interface SupplierDialogProps extends BaseComponentProps {
  isRecipient?: undefined;
  company?: undefined;
  setLanguage?: undefined;
}

interface RecipientDialogProps extends BaseComponentProps {
  isRecipient: true;
  company: Company;
  setLanguage: SetState<Language>;
}

type ComponentProps = SupplierDialogProps | RecipientDialogProps;

export default function PartnerDialog({
  isOpen,
  setIsOpen,
  isRecipient,
  partnerInput: [partner, setPartner],
  company,
  setLanguage
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const [isIndividual, setIsIndividual] = useState(false);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [name, setName] = useState("");
  const [regNum, setRegNum] = useState("");
  const [vatNum, setVatNum] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [isPartner, setIsPartner] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState<
    CreatePaymentMethodModelRow[]
  >([]);

  function onPartnerSelect(option: CompanyWithMethods) {
    setIsIndividual(option.isIndividual);
    const country = countries.find(({ iso2 }) => iso2 === option.country);
    setCountry(country || DEFAULT_COUNTRY);
    setName(option.name);
    setRegNum(option.regNum);
    setVatNum(option.vatNum);
    setAddress(option.address);
    setEmail(option.email);
    setUrl(option.url);
    setPhone(option.phone);
    setNote(option.note);

    const paymentMethods = mapPaymentMethodsToCreatePaymentMethodModelRows(
      option.paymentMethods
    );
    setPaymentMethods(paymentMethods);

    if (isRecipient && setLanguage && company)
      setLanguage(option.language || company.language || DEFAULT_LANGUAGE);
  }

  async function saveData(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    setPartner({
      ...partner,
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
      isPartner,
      paymentMethods
    });

    setIsOpen(false);
  }

  useEffect(() => {
    setIsIndividual(partner.isIndividual);
    const country = countries.find(({ iso2 }) => iso2 === partner.country);
    setCountry(country || DEFAULT_COUNTRY);
    setName(partner.name);
    setRegNum(partner.regNum);
    setVatNum(partner.vatNum);
    setAddress(partner.address);
    setEmail(partner.email);
    setUrl(partner.url);
    setPhone(partner.phone);
    setNote(partner.note);
    setIsPartner(!!partner.isPartner);
    setPaymentMethods(partner.paymentMethods || []);
  }, [isOpen, partner]);

  return (
    <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {!isRecipient && dict.labels.supplier}
            {isRecipient && dict.labels.recipient}
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="general" className="overflow-auto">
          <TabsList>
            <TabsTrigger value="general">{dict.labels.general}</TabsTrigger>
            <TabsTrigger value="paymentMethods">
              {dict.labels.paymentMethods}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="overflow-auto">
            <GeneralInfoForm
              hideComment
              isPartnerInput={isRecipient}
              isIndividualInput={[isIndividual, setIsIndividual]}
              onPartnerSelect={onPartnerSelect}
              countryInput={[country, setCountry]}
              nameInput={[name, setName, ""]}
              regNumInput={[regNum, setRegNum]}
              vatNumInput={[vatNum, setVatNum]}
              addressInput={[address, setAddress]}
              emailInput={[email, setEmail]}
              urlInput={[url, setUrl]}
              phoneInput={[phone, setPhone]}
              noteInput={[note, setNote]}
              commentInput={["", () => {}]}
            />
          </TabsContent>
          <TabsContent value="paymentMethods" className="overflow-auto">
            <PaymentMethodsTab
              showPaymentMethodInput
              isPartner={isRecipient}
              partnerRegNum={regNum}
              paymentMethods={paymentMethods}
              setPaymentMethods={setPaymentMethods}
            />
          </TabsContent>
        </Tabs>
        <div className="flex items-center gap-2">
          <Checkbox
            id="isPartner"
            checked={isPartner}
            onCheckedChange={(value) => setIsPartner(!!value)}
          />
          <Label htmlFor="isPartner">{dict.labels.createOrUpdatePartner}</Label>
        </div>
        <DialogFooter>
          <Button type="submit" className="w-36" onClick={saveData}>
            {dict.labels.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
