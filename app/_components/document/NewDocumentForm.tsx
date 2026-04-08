"use client";

import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import { createDocumentAction } from "@/app/_lib/serverActions/document";
import {
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  DEFAULT_DUE_PERIOD,
  DEFAULT_LANGUAGE,
  DEFAULT_LATE_FEE_RATE
} from "@/app/_lib/constants/general";
import { CreateItemModelRow } from "@/app/_lib/types/item";
import { LogoWithUrl } from "@/app/_lib/types/logo";
import { emptyCompany, emptyItem } from "@/app/_lib/constants/document";
import DocumentForm from "./DocumentForm";
import { getDocumentSettingsAction } from "@/app/_lib/serverActions/documentSettings";
import { formatDocNum } from "@/app/_lib/functions/documentSettings";
import { CompanyWithMethods } from "@/app/_lib/types/company";
import { CreatePaymentMethodModelRow } from "@/app/_lib/types/paymentMethod";
import {
  DocumentStatus,
  DocumentType,
  Language,
  SignatureType
} from "@/app/_prisma/enums";
import { CreateDocumentSettlementRow } from "@/app/_lib/types/document";
import { Company, PaymentMethod, Unit } from "@/app/_prisma/browser";
import { shiftDateToUTC } from "@/app/_lib/functions/document";
import { mapPaymentMethodsToCreatePaymentMethodModelRows } from "@/app/_lib/functions/paymentMethod";

interface ComponentProps {
  company: Company;
  paymentMethods: PaymentMethod[];
  companyLogo: LogoWithUrl | null;
  partner: CompanyWithMethods | null;
  units: Unit[];
}

export default function NewDocumentForm({
  company,
  paymentMethods,
  companyLogo,
  partner,
  units
}: ComponentProps) {
  const [type, setType] = useState<DocumentType>(DocumentType.INVOICE);
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [currency, setCurrency] = useState("");
  const [status, setStatus] = useState<DocumentStatus>(DocumentStatus.DRAFT);
  const [signatureType, setSignatureType] = useState<SignatureType>(
    SignatureType.WITHOUT_SIGNATURE
  );
  const [showElectronicSignatureNotice, setShowElectronicSignatureNotice] =
    useState(false);
  const [docNum, setDocNum] = useState("");
  const [docDate, setDocDate] = useState(shiftDateToUTC(new Date()));
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState(shiftDateToUTC(new Date()));
  const [duePeriod, setDuePeriod] = useState(NaN);
  const [lateFeeRate, setLateFeeRate] = useState(NaN);
  const [note, setNote] = useState("");

  const [supplier, setSupplier] = useState(structuredClone(emptyCompany));
  const [recipient, setRecipient] = useState(structuredClone(emptyCompany));

  const [multipleVat, setMultipleVat] = useState(false);
  const [vatRate, setVatRate] = useState(NaN);
  const [multipleDiscount, setMultipleDiscount] = useState(false);
  const [discountRate, setDiscountRate] = useState(0);
  const [items, setItems] = useState<CreateItemModelRow[]>([]);
  const [currencyRate, setCurrencyRate] = useState(0);
  const [showCurrencyRate, setShowCurrencyRate] = useState(false);
  const [paymentMethodType, setPaymentMethodType] = useState("");
  const [color, setColor] = useState("");

  const [supplierSignatureName, setSupplierSignatureName] = useState("");
  const [supplierSignatureDate, setSupplierSignatureDate] =
    useState<Date | null>(new Date());
  const [supplierSignatureHasLine, setSupplierSignatureHasLine] =
    useState(true);

  const [recipientSignatureName, setRecipientSignatureName] = useState("");
  const [recipientSignatureDate, setRecipientSignatureDate] =
    useState<Date | null>(new Date());
  const [recipientSignatureHasLine, setRecipientSignatureHasLine] =
    useState(true);

  const [showCarrier, setShowCarrier] = useState(true);
  const [carrierCountry, setCarrierCountry] = useState(DEFAULT_COUNTRY);
  const [carrierName, setCarrierName] = useState("");
  const [carrierRegNum, setCarrierRegNum] = useState("");
  const [driver, setDriver] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [vehicleNum, setVehicleNum] = useState("");
  const [originAddress, setOriginAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");

  const [fromDocuments, setFromDocuments] = useState<
    CreateDocumentSettlementRow[]
  >([]);

  useEffect(() => {
    getDocumentSettingsAction(type)
      .then((res) => {
        if (!res.data) return;

        const docNum = formatDocNum(res.data.docNum, res.data.index);
        setDocNum(docNum);
        setNote(res.data.note);
      })
      .catch(() => {});
  }, [type]);

  useEffect(() => {
    if (!company) return;

    const language = partner?.language || company.language || DEFAULT_LANGUAGE;
    const currency = partner?.currency || company.currency || DEFAULT_CURRENCY;
    setLanguage(language);
    setCurrency(currency);
    const now = new Date();
    const docDate = shiftDateToUTC(now);
    const duePeriod =
      partner?.duePeriod ?? company.duePeriod ?? DEFAULT_DUE_PERIOD;
    const dueDate = new Date(docDate);
    dueDate.setDate(docDate.getDate() + duePeriod);

    const dateFrom = shiftDateToUTC(
      new Date(now.getFullYear(), now.getMonth() - 1, 1)
    );
    const dateTo = shiftDateToUTC(
      new Date(now.getFullYear(), now.getMonth(), 0)
    );

    const lateFeeRate =
      partner?.lateFeeRate ?? company.lateFeeRate ?? DEFAULT_LATE_FEE_RATE;

    setDocDate(docDate);
    setDuePeriod(duePeriod);
    setDueDate(dueDate);
    setDateFrom(dateFrom);
    setDateTo(dateTo);
    setLateFeeRate(lateFeeRate);
    setColor(company.color);

    const supplierPaymentMethods =
      mapPaymentMethodsToCreatePaymentMethodModelRows(
        paymentMethods.filter((method) => method.showByDefault)
      );
    setSupplier({
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
      comment: "",
      language,
      currency,
      duePeriod,
      lateFeeRate,
      vatRate: NaN,
      isPartner: false,
      paymentMethods: supplierPaymentMethods
    });

    if (partner) {
      const recipientPaymentMethods =
        mapPaymentMethodsToCreatePaymentMethodModelRows(partner.paymentMethods);
      setRecipient({
        isIndividual: partner.isIndividual,
        country: partner.country,
        name: partner.name,
        regNum: partner.regNum,
        vatNum: partner.vatNum,
        address: partner.address,
        email: partner.email,
        url: partner.url,
        phone: partner.phone,
        note: partner.note,
        comment: "",
        language,
        currency,
        duePeriod,
        lateFeeRate,
        vatRate: NaN,
        isPartner: false,
        paymentMethods: recipientPaymentMethods
      });
    }

    setItems([
      {
        ...structuredClone(emptyItem),
        rowId: uuidv4(),
        currency,
        discountRate: 0,
        vatRate: company.vatRate ?? NaN
      }
    ]);

    setVatRate(company.vatRate ?? NaN);
  }, [company, paymentMethods, partner]);

  return (
    <DocumentForm
      isNew
      company={company}
      companyLogo={companyLogo}
      documentLogo={null}
      units={units}
      documentEvents={[]}
      typeInput={[type, setType]}
      currencyInput={[currency, setCurrency]}
      languageInput={[language, setLanguage]}
      statusInput={[status, setStatus]}
      signatureTypeInput={[signatureType, setSignatureType]}
      showElectronicSignatureNoticeInput={[
        showElectronicSignatureNotice,
        setShowElectronicSignatureNotice
      ]}
      docNumInput={[docNum, setDocNum]}
      docDateInput={[docDate, setDocDate]}
      dateFromInput={[dateFrom, setDateFrom]}
      dateToInput={[dateTo, setDateTo]}
      dueDateInput={[dueDate, setDueDate]}
      duePeriodInput={[duePeriod, setDuePeriod]}
      lateFeeRateInput={[lateFeeRate, setLateFeeRate]}
      noteInput={[note, setNote]}
      supplierInput={[supplier, setSupplier]}
      recipientInput={[recipient, setRecipient]}
      multipleVatInput={[multipleVat, setMultipleVat]}
      vatRateInput={[vatRate, setVatRate]}
      multipleDiscountInput={[multipleDiscount, setMultipleDiscount]}
      discountRateInput={[discountRate, setDiscountRate]}
      itemsInput={[items, setItems]}
      currencyRateInput={[currencyRate, setCurrencyRate]}
      showCurrencyRateInput={[showCurrencyRate, setShowCurrencyRate]}
      paymentMethodTypeInput={[paymentMethodType, setPaymentMethodType]}
      colorInput={[color, setColor]}
      supplierSignatureNameInput={[
        supplierSignatureName,
        setSupplierSignatureName
      ]}
      supplierSignatureDateInput={[
        supplierSignatureDate,
        setSupplierSignatureDate
      ]}
      supplierSignatureHasLineInput={[
        supplierSignatureHasLine,
        setSupplierSignatureHasLine
      ]}
      recipientSignatureNameInput={[
        recipientSignatureName,
        setRecipientSignatureName
      ]}
      recipientSignatureDateInput={[
        recipientSignatureDate,
        setRecipientSignatureDate
      ]}
      recipientSignatureHasLineInput={[
        recipientSignatureHasLine,
        setRecipientSignatureHasLine
      ]}
      showCarrierInput={[showCarrier, setShowCarrier]}
      carrierCountryInput={[carrierCountry, setCarrierCountry]}
      carrierNameInput={[carrierName, setCarrierName]}
      carrierRegNumInput={[carrierRegNum, setCarrierRegNum]}
      driverInput={[driver, setDriver]}
      vehicleInput={[vehicle, setVehicle]}
      vehicleNumInput={[vehicleNum, setVehicleNum]}
      originAddressInput={[originAddress, setOriginAddress]}
      destinationAddressInput={[destinationAddress, setDestinationAddress]}
      fromDocumentsInput={[fromDocuments, setFromDocuments]}
      saveRecordAction={createDocumentAction}
    />
  );
}
