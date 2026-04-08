"use client";

import { Button } from "@/app/_shadcn/components/ui/button";
import {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useContext,
  useEffect,
  useState
} from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { useInputValue } from "@/app/_lib/hooks/useInputValue";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import { DEFAULT_COUNTRY, toastHelper } from "@/app/_lib/constants/general";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/app/_shadcn/components/ui/tabs";
import GeneralInfoTab from "../company/GeneralInfoForm";
import {
  CompanyWithMethods,
  CreateCompanyModel
} from "@/app/_lib/types/company";
import {
  createPartnersAction,
  getPartnerAction,
  updateCompanyAction
} from "@/app/_lib/serverActions/company";
import PaymentMethodsTab from "./PaymentMethodsTab";
import { CreatePaymentMethodModelRow } from "@/app/_lib/types/paymentMethod";
import { countries } from "@/app/_lib/constants/countries";
import SettingsTab from "./SettingsTab";
import { Language } from "@/app/_prisma/enums";
import { round, toFixed } from "@/app/_lib/functions/general";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/_shadcn/components/ui/dialog";
import { mapPaymentMethodsToCreatePaymentMethodModelRows } from "@/app/_lib/functions/paymentMethod";

interface ComponentProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isCopy: boolean;
  partnerId: string;
}

export default function CopyOrEditPartnerDialog({
  isOpen,
  setIsOpen,
  isCopy,
  partnerId
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const { isLoading, setIsLoading } = useFormState();

  const [partner, setPartner] = useState<CompanyWithMethods | null>(null);

  const [isIndividual, setIsIndividual] = useState(false);
  const [country, setCountry] = useInputValue(DEFAULT_COUNTRY);
  const [name, setName, nameError, setNameError] = useInputValue("");
  const [regNum, setRegNum] = useInputValue("");
  const [vatNum, setVatNum] = useInputValue("");
  const [address, setAddress] = useInputValue("");
  const [email, setEmail] = useInputValue("");
  const [url, setUrl] = useInputValue("");
  const [phone, setPhone] = useInputValue("");
  const [note, setNote] = useInputValue("");
  const [comment, setComment] = useInputValue("");
  const [language, setLanguage] = useInputValue<Language | null>(null);
  const [currency, setCurrency] = useInputValue("");
  const [duePeriod, setDuePeriod] = useInputValue("");
  const [lateFeeRate, setLateFeeRate] = useInputValue("");

  const [paymentMethods, setPaymentMethods] = useInputValue<
    CreatePaymentMethodModelRow[]
  >([]);

  async function createOrUpdateRecord(e: MouseEvent<HTMLButtonElement>) {
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
      language,
      currency,
      duePeriod: round(parseFloat(duePeriod), 0),
      lateFeeRate: round(parseFloat(lateFeeRate) * 0.01, 4),
      vatRate: NaN,
      paymentMethods
    };
    if (isCopy) model.isPartner = true;

    setIsLoading(true);
    const res = isCopy
      ? await createPartnersAction([model])
      : await updateCompanyAction(partnerId, model);
    setIsLoading(false);

    if (res.ok) {
      toastHelper.success(dict);
      setIsOpen(false);
    } else toastHelper.error(dict);
  }

  useEffect(() => {
    if (!isOpen) setPartner(null);
    else
      getPartnerAction(partnerId)
        .then((res) => {
          setPartner(res.data);
          if (!res.data) toastHelper.error(dict);
        })
        .catch(() => toastHelper.error(dict));
  }, [isOpen, partnerId]);

  useEffect(() => {
    setIsIndividual(!!partner?.isIndividual);
    const country = countries.find(({ iso2 }) => iso2 === partner?.country);
    setCountry(country || DEFAULT_COUNTRY);
    setName(partner?.name || "");
    setRegNum(partner?.regNum || "");
    setVatNum(partner?.vatNum || "");
    setAddress(partner?.address || "");
    setEmail(partner?.email || "");
    setUrl(partner?.url || "");
    setPhone(partner?.phone || "");
    setNote(partner?.note || "");
    setComment(partner?.comment || "");
    setLanguage(partner?.language || null);
    setCurrency(partner?.currency || "");
    setDuePeriod(toFixed(partner?.duePeriod ?? NaN, 0));
    setLateFeeRate(toFixed((partner?.lateFeeRate ?? NaN) * 100, 2));

    const paymentMethods = mapPaymentMethodsToCreatePaymentMethodModelRows(
      partner?.paymentMethods ?? []
    );
    setPaymentMethods(paymentMethods);
  }, [partner]);

  return (
    <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCopy ? dict.labels.addPartner : dict.labels.editPartner}
          </DialogTitle>
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
            <GeneralInfoTab
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
            onClick={createOrUpdateRecord}
          >
            {dict.labels.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
