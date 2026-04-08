"use client";

import { useContext, useEffect, useState } from "react";
import LogoDialog from "./LogoDialog";
import MainInfoDialog from "./MainInfoDialog";
import { LocaleContext } from "../context/LocaleProvider";
import { Result, SetState } from "@/app/_lib/types/general";
import { CreateCompanyModel } from "@/app/_lib/types/company";
import ItemsTable from "./ItemsTable";
import { CreateItemModelRow } from "@/app/_lib/types/item";
import { calculateDocumentTotals } from "@/app/_lib/functions/general";
import DropdownInput from "../input/DropdownInput";
import { Label } from "@/app/_shadcn/components/ui/label";
import { currencies } from "@/app/_lib/constants/currencies";
import { Button } from "@/app/_shadcn/components/ui/button";
import { LogoAction, LogoWithUrl } from "@/app/_lib/types/logo";
import {
  CreateDocumentModel,
  CreateDocumentSettlementRow,
  DocumentWithChildren
} from "@/app/_lib/types/document";
import { DocumentEventWithUser } from "@/app/_lib/types/documentEvent";
import {
  languages,
  statuses,
  toastHelper,
  types,
  signatureTypes
} from "@/app/_lib/constants/general";
import { useRouter } from "next/navigation";
import { useFormState } from "@/app/_lib/hooks/useFormState";
import PartnersSection from "./PartnersSection";
import SignatureDialog from "./SignatureDialog";
import CarrierDialog from "./CarrierDialog";
import { Country } from "@/app/_lib/constants/countries";
import {
  Company,
  DocumentStatus,
  DocumentType,
  Language,
  SignatureType,
  Unit
} from "@/app/_prisma/browser";
import { deleteDocumentAction } from "@/app/_lib/serverActions/document";
import ConfirmActionDialog from "@/app/_components/general/ConfirmActionDialog";
import SendViaEmailDialog from "./SendViaEmailDialog";
import DocumentHistoryDialog from "./DocumentHistoryDialog";
import DocumentActions from "./DocumentActions";

interface ComponentProps {
  documentObject?: DocumentWithChildren;
  isNew?: boolean;
  company: Company;
  companyLogo: LogoWithUrl | null;
  documentLogo: LogoWithUrl | null;
  units: Unit[];
  documentEvents?: DocumentEventWithUser[];
  //
  docNumInput: [string, SetState<string>];
  docDateInput: [Date, SetState<Date>];
  dateFromInput: [Date | null, SetState<Date | null>];
  dateToInput: [Date | null, SetState<Date | null>];
  dueDateInput: [Date, SetState<Date>];
  duePeriodInput: [number, SetState<number>];
  lateFeeRateInput: [number, SetState<number>];
  noteInput: [string, SetState<string>];
  //
  supplierInput: [CreateCompanyModel, SetState<CreateCompanyModel>];
  recipientInput: [CreateCompanyModel, SetState<CreateCompanyModel>];
  //
  multipleVatInput: [boolean, SetState<boolean>];
  vatRateInput: [number, SetState<number>];
  multipleDiscountInput: [boolean, SetState<boolean>];
  discountRateInput: [number, SetState<number>];
  itemsInput: [CreateItemModelRow[], SetState<CreateItemModelRow[]>];
  currencyRateInput: [number, SetState<number>];
  showCurrencyRateInput: [boolean, SetState<boolean>];
  paymentMethodTypeInput: [string, SetState<string>];
  colorInput: [string, SetState<string>];
  //
  signatureTypeInput: [SignatureType, SetState<SignatureType>];
  showElectronicSignatureNoticeInput: [boolean, SetState<boolean>];
  typeInput: [DocumentType, SetState<DocumentType>];
  currencyInput: [string, SetState<string>];
  languageInput: [Language, SetState<Language>];
  statusInput: [DocumentStatus, SetState<DocumentStatus>];
  //
  // logoProp: LogoWithUrl | null;
  //
  supplierSignatureNameInput: [string, SetState<string>];
  supplierSignatureDateInput: [Date | null, SetState<Date | null>];
  supplierSignatureHasLineInput: [boolean, SetState<boolean>];
  recipientSignatureNameInput: [string, SetState<string>];
  recipientSignatureDateInput: [Date | null, SetState<Date | null>];
  recipientSignatureHasLineInput: [boolean, SetState<boolean>];
  //
  showCarrierInput: [boolean, SetState<boolean>];
  carrierCountryInput: [Country, SetState<Country>];
  carrierNameInput: [string, SetState<string>, string?];
  carrierRegNumInput: [string, SetState<string>];
  driverInput: [string, SetState<string>];
  vehicleInput: [string, SetState<string>];
  vehicleNumInput: [string, SetState<string>];
  originAddressInput: [string, SetState<string>];
  destinationAddressInput: [string, SetState<string>];
  //
  fromDocumentsInput: [
    CreateDocumentSettlementRow[],
    SetState<CreateDocumentSettlementRow[]>
  ];
  //
  saveRecordAction: (
    model: CreateDocumentModel
  ) => Promise<
    | Result<false, null>
    | Result<true, { documentId: string; logoUploadUrl: string }>
  >;
}

export default function DocumentForm({
  documentObject,
  isNew,
  company,
  companyLogo,
  documentLogo,
  units,
  documentEvents,
  docNumInput,
  docDateInput,
  dateFromInput,
  dateToInput,
  dueDateInput,
  duePeriodInput,
  lateFeeRateInput,
  noteInput,
  supplierInput,
  recipientInput,
  multipleVatInput,
  vatRateInput,
  multipleDiscountInput,
  discountRateInput,
  itemsInput,
  currencyRateInput,
  showCurrencyRateInput,
  paymentMethodTypeInput,
  colorInput,
  signatureTypeInput,
  showElectronicSignatureNoticeInput,
  typeInput,
  currencyInput,
  languageInput,
  statusInput,
  supplierSignatureNameInput,
  supplierSignatureDateInput,
  supplierSignatureHasLineInput,
  recipientSignatureNameInput,
  recipientSignatureDateInput,
  recipientSignatureHasLineInput,
  showCarrierInput,
  carrierCountryInput,
  carrierNameInput,
  carrierRegNumInput,
  driverInput,
  vehicleInput,
  vehicleNumInput,
  originAddressInput,
  destinationAddressInput,
  fromDocumentsInput,
  // logoProp,
  saveRecordAction
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);

  const router = useRouter();

  const { isLoading, setIsLoading } = useFormState();

  const [docNum] = docNumInput;
  const [docDate] = docDateInput;
  const [dateFrom] = dateFromInput;
  const [dateTo] = dateToInput;
  const [dueDate] = dueDateInput;
  const [duePeriod] = duePeriodInput;
  const [lateFeeRate] = lateFeeRateInput;
  const [note] = noteInput;
  const [supplier] = supplierInput;
  const [recipient] = recipientInput;

  const [items] = itemsInput;
  const [signatureType, setSignatureType] = signatureTypeInput;
  const [showElectronicSignatureNotice, setShowElectronicSignatureNotice] =
    showElectronicSignatureNoticeInput;
  const [type, setType] = typeInput;
  const [currency, setCurrency] = currencyInput;
  const [language, setLanguage] = languageInput;
  const [status, setStatus] = statusInput;
  const [currencyRate] = currencyRateInput;
  const [showCurrencyRate] = showCurrencyRateInput;
  const [paymentMethodType] = paymentMethodTypeInput;
  const [color] = colorInput;

  const [showCarrier] = showCarrierInput;
  const [carrierCountry] = carrierCountryInput;
  const [carrierName] = carrierNameInput;
  const [carrierRegNum] = carrierRegNumInput;
  const [driver] = driverInput;
  const [vehicle] = vehicleInput;
  const [vehicleNum] = vehicleNumInput;
  const [originAddress] = originAddressInput;
  const [destinationAddress] = destinationAddressInput;
  const [fromDocuments] = fromDocumentsInput;

  const [logoAction, setLogoAction] = useState(LogoAction.KEEP);
  const [logo, setLogo] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState("");

  const [baseTotal, setBaseTotal] = useState(0);
  const [discountTotal, setDiscountTotal] = useState(0);
  const [netTotal, setNetTotal] = useState(0);
  const [nonTaxableNetTotal, setNonTaxableNetTotal] = useState(0);
  const [vats, setVats] = useState(
    new Map<number, { taxableNetTotal: number; vatTotal: number }>()
  );
  const [lateFeeTotal, setLateFeeTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [grossTotal, setGrossTotal] = useState(0);

  const [supplierSignatureName] = supplierSignatureNameInput;
  const [supplierSignatureDate] = supplierSignatureDateInput;
  const [supplierSignatureHasLine] = supplierSignatureHasLineInput;
  const [recipientSignatureName] = recipientSignatureNameInput;
  const [recipientSignatureDate] = recipientSignatureDateInput;
  const [recipientSignatureHasLine] = recipientSignatureHasLineInput;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSendEmailOpen, setIsSendEmailOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  async function deleteDocument() {
    if (!documentObject) return;
    const res = await deleteDocumentAction(documentObject.id);

    if (res.ok) toastHelper.success(dict);
    else toastHelper.error(dict);
    setIsDeleteOpen(false);

    router.push("/documents");
  }

  async function saveRecord() {
    const model: CreateDocumentModel = {
      docNum,
      type,
      status,
      language,
      currency,
      docDate,
      dateFrom,
      dateTo,
      dueDate,
      duePeriod,
      lateFeeRate,
      note,
      signatureType,
      showElectronicSignatureNotice,

      netTotal,
      grossTotal,
      currencyRate: currency !== company.currency ? currencyRate : 0,
      showCurrencyRate: currency !== company.currency && showCurrencyRate,
      paymentMethodType,
      color,

      showCarrier,
      carrierCountry: carrierCountry.iso2,
      carrierName,
      carrierRegNum,
      driver,
      vehicle,
      vehicleNum,
      originAddress,
      destinationAddress,

      logoAction,

      supplier: {
        country: supplier.country,
        isIndividual: supplier.isIndividual,
        name: supplier.name,
        regNum: supplier.regNum,
        vatNum: supplier.vatNum,
        address: supplier.address,
        email: supplier.email,
        url: supplier.url,
        phone: supplier.phone,
        note: supplier.note,
        comment: "",
        language,
        currency,
        duePeriod,
        lateFeeRate,
        vatRate: NaN,
        isPartner: supplier.isPartner,
        paymentMethods: supplier.paymentMethods
      },

      recipient: {
        country: recipient.country,
        isIndividual: recipient.isIndividual,
        name: recipient.name,
        regNum: recipient.regNum,
        vatNum: recipient.vatNum,
        address: recipient.address,
        email: recipient.email,
        url: recipient.url,
        phone: recipient.phone,
        note: recipient.note,
        comment: "",
        language,
        currency,
        duePeriod,
        lateFeeRate,
        vatRate: NaN,
        isPartner: recipient.isPartner,
        paymentMethods: recipient.paymentMethods
      },

      items,

      supplierSignatureName,
      supplierSignatureDate,
      supplierSignatureHasLine,
      recipientSignatureName,
      recipientSignatureDate,
      recipientSignatureHasLine,

      fromDocuments
    };

    setIsLoading(true);
    const res = await saveRecordAction(model);

    // TODO: check if refresh() from next/cache does not break img upload to object storage.
    if (res.ok && res.data.logoUploadUrl && logo) {
      await fetch(res.data.logoUploadUrl, {
        method: "PUT",
        body: logo,
        headers: { "Content-Type": logo.type }
      });
    }

    setIsLoading(false);

    if (res.ok) {
      toastHelper.success(dict);
      setTimeout(() => {
        router.push(`/documents/edit/${res.data.documentId}`);
      }, 500);
    } else toastHelper.error(dict);
  }

  useEffect(() => {
    const {
      baseTotal,
      discountTotal,
      netTotal,
      nonTaxableNetTotal,
      vats,
      lateFeeTotal,
      subtotal,
      grossTotal
    } = calculateDocumentTotals(items, dueDate, lateFeeRate, fromDocuments);

    setBaseTotal(baseTotal);
    setDiscountTotal(discountTotal);
    setNetTotal(netTotal);
    setNonTaxableNetTotal(nonTaxableNetTotal);
    setVats(vats);
    setSubtotal(subtotal);
    setLateFeeTotal(lateFeeTotal);
    setGrossTotal(grossTotal);
  }, [items, dueDate, lateFeeRate, fromDocuments]);

  useEffect(() => {
    setLogoAction(isNew ? LogoAction.CONNECT : LogoAction.KEEP);
    setLogo(null);
    if (isNew) setPreviewSrc(companyLogo?.url || "");
    else setPreviewSrc(documentLogo?.url || "");
  }, [isNew, companyLogo, documentLogo]);

  return (
    <div className="">
      <DocumentActions
        isLoading={isLoading}
        documentObject={documentObject}
        saveRecord={saveRecord}
        setIsSendEmailOpen={setIsSendEmailOpen}
        setIsHistoryOpen={setIsHistoryOpen}
        setIsDeleteOpen={setIsDeleteOpen}
      />
      <ConfirmActionDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        description={dict.labels.permanentlyDelete}
        confirmText={dict.labels.delete}
        onConfirm={deleteDocument}
      />
      {documentObject && (
        <SendViaEmailDialog
          isOpen={isSendEmailOpen}
          setIsOpen={setIsSendEmailOpen}
          document={documentObject}
        />
      )}
      {documentObject && (
        <DocumentHistoryDialog
          isOpen={isHistoryOpen}
          setIsOpen={setIsHistoryOpen}
          events={documentEvents ?? []}
        />
      )}
      <div className="mt-8 p-8 bg-secondary rounded-3xl grid grid-cols-3 gap-6">
        <div>
          <Label htmlFor="type">{dict.labels.documentType}</Label>
          <DropdownInput
            className="mt-2 w-full"
            selected={type}
            options={types}
            renderOption={(option) => dict.documentType[option]}
            onChange={(option) => option && setType(option)}
          />
        </div>
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
          <Label htmlFor="currency">{dict.labels.currency}</Label>
          <DropdownInput
            className="mt-2 w-full"
            selected={currency}
            options={currencies}
            onChange={(option) => option && setCurrency(option)}
          />
        </div>
        <div>
          <Label htmlFor="status">{dict.labels.status}</Label>
          <DropdownInput
            className="mt-2 w-full"
            selected={status}
            options={statuses}
            renderOption={(option) => dict.documentStatus[option]}
            onChange={(option) => option && setStatus(option)}
          />
        </div>
        <div>
          <Label htmlFor="signatureType">{dict.labels.signature}</Label>
          <DropdownInput
            className="mt-2 w-full"
            selected={signatureType}
            options={signatureTypes}
            renderOption={(option) => dict.signatureType[option]}
            onChange={(option) => option && setSignatureType(option)}
          />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-6">
        <LogoDialog
          companyLogo={companyLogo}
          logoActionInput={[logoAction, setLogoAction]}
          logoInput={[logo, setLogo]}
          previewSrcInput={[previewSrc, setPreviewSrc]}
          colorInput={colorInput}
        />
        <MainInfoDialog
          type={type}
          docNumInput={docNumInput}
          docDateInput={docDateInput}
          dateFromInput={dateFromInput}
          dateToInput={dateToInput}
          dueDateInput={dueDateInput}
          duePeriodInput={duePeriodInput}
          lateFeeRateInput={lateFeeRateInput}
        />
      </div>
      <div className="mt-8">
        <PartnersSection
          company={company}
          supplierInput={supplierInput}
          recipientInput={recipientInput}
          setLanguage={setLanguage}
          color={color}
        />
      </div>
      {type === DocumentType.WAYBILL && (
        <div className="mt-8 grid grid-cols-2 gap-6">
          <div />
          <div>
            <div className="p-4 text-lg text-accent-foreground border-b border-accent-foreground">
              {dict.labels.carrier}
            </div>
            <div className="mt-6">
              <CarrierDialog
                showCarrierInput={showCarrierInput}
                countryInput={carrierCountryInput}
                nameInput={carrierNameInput}
                regNumInput={carrierRegNumInput}
                driverInput={driverInput}
                vehicleInput={vehicleInput}
                vehicleNumInput={vehicleNumInput}
                originAddressInput={originAddressInput}
                destinationAddressInput={destinationAddressInput}
              />
            </div>
          </div>
        </div>
      )}
      <div className="mt-8">
        <ItemsTable
          company={company}
          units={units}
          itemsInput={itemsInput}
          multipleVatInput={multipleVatInput}
          multipleDiscountInput={multipleDiscountInput}
          noteInput={noteInput}
          language={language}
          currency={currency}
          discountRateInput={discountRateInput}
          vatRateInput={vatRateInput}
          baseTotal={baseTotal}
          discountTotal={discountTotal}
          netTotal={netTotal}
          nonTaxableNetTotal={nonTaxableNetTotal}
          vats={vats}
          subtotal={subtotal}
          lateFeeTotal={lateFeeTotal}
          grossTotal={grossTotal}
          currencyRateInput={currencyRateInput}
          showCurrencyRateInput={showCurrencyRateInput}
          paymentMethodTypeInput={paymentMethodTypeInput}
          fromDocumentsInput={fromDocumentsInput}
        />
      </div>
      <div className="mt-8">
        {signatureType === SignatureType.WITHOUT_SIGNATURE && (
          <div className="text-center">{dict.labels.validWithoutSignature}</div>
        )}
        <div className="grid grid-cols-2 gap-6">
          {(signatureType === SignatureType.ONLY_SUPPLIER_SIGNATURE ||
            signatureType === SignatureType.BOTH_SIGNATURES) && (
            <div>
              <div className="mb-4 pl-8">{dict.labels.supplier}</div>
              <SignatureDialog
                nameInput={supplierSignatureNameInput}
                dateInput={supplierSignatureDateInput}
                hasLineInput={supplierSignatureHasLineInput}
                showElectronicSignatureNoticeInput={
                  showElectronicSignatureNoticeInput
                }
              />
            </div>
          )}
          {signatureType === SignatureType.BOTH_SIGNATURES && (
            <div>
              <div className="mb-4 pl-8">{dict.labels.recipient}</div>
              <SignatureDialog
                nameInput={recipientSignatureNameInput}
                dateInput={recipientSignatureDateInput}
                hasLineInput={recipientSignatureHasLineInput}
                showElectronicSignatureNoticeInput={
                  showElectronicSignatureNoticeInput
                }
              />
            </div>
          )}
        </div>
        {signatureType !== SignatureType.WITHOUT_SIGNATURE &&
          showElectronicSignatureNotice && (
            <div className="mt-4 text-center text-xs text-secondary-foreground">
              {dict.labels.electronicSignatureNotice}
            </div>
          )}
      </div>
      <div className="mt-6 flex justify-end">
        <Button
          isLoading={isLoading}
          disabled={isLoading}
          onClick={saveRecord}
          className="w-48"
        >
          {dict.labels.save}
        </Button>
      </div>
    </div>
  );
}
