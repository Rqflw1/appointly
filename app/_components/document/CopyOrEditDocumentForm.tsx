"use client";

import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import {
  createDocumentAction,
  updateDocumentAction
} from "@/app/_lib/serverActions/document";
import {
  CreateDocumentModel,
  CreateDocumentSettlementRow,
  DocumentWithChildren
} from "@/app/_lib/types/document";
import { DocumentEventWithUser } from "@/app/_lib/types/documentEvent";
import {
  DEFAULT_COUNTRY,
  DEFAULT_LANGUAGE
} from "@/app/_lib/constants/general";
import { CreateItemModelRow } from "@/app/_lib/types/item";
import { LogoWithUrl } from "@/app/_lib/types/logo";
import { emptyCompany } from "@/app/_lib/constants/document";
import DocumentForm from "./DocumentForm";
import { countries } from "@/app/_lib/constants/countries";
import {
  Company,
  DocumentStatus,
  DocumentType,
  Language,
  SignatureType,
  Unit
} from "@/app/_prisma/browser";
import { shiftDateToUTC } from "@/app/_lib/functions/document";
import { mapPaymentMethodsToCreatePaymentMethodModelRows } from "@/app/_lib/functions/paymentMethod";
import { getDocumentSettingsAction } from "@/app/_lib/serverActions/documentSettings";
import { formatDocNum } from "@/app/_lib/functions/documentSettings";

interface ComponentProps {
  isCopy?: boolean;
  company: Company;
  companyLogo: LogoWithUrl | null;
  document: DocumentWithChildren;
  documentLogo: LogoWithUrl | null;
  units: Unit[];
  documentEvents: DocumentEventWithUser[];
}

export default function CopyOrEditDocumentForm({
  isCopy,
  company,
  companyLogo,
  document,
  documentLogo,
  units,
  documentEvents
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
  const [discountRate, setDiscountRate] = useState(NaN);
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

  async function updateDocument(model: CreateDocumentModel) {
    return isCopy
      ? await createDocumentAction(model)
      : await updateDocumentAction(document.id, model);
  }

  useEffect(() => {
    setType(document.type);
    setLanguage(document.language);
    setCurrency(document.currency);
    setStatus(document.status);
    setDocNum(document.docNum);

    setDocDate(document.docDate);
    setDateFrom(document.dateFrom);
    setDateTo(document.dateTo);
    setDuePeriod(document.duePeriod);
    setDueDate(document.dueDate);
    setLateFeeRate(document.lateFeeRate);

    setNote(document.note);
    setSignatureType(document.signatureType);
    setShowElectronicSignatureNotice(document.showElectronicSignatureNotice);

    setColor(document.color);

    const supplierPaymentMethods =
      mapPaymentMethodsToCreatePaymentMethodModelRows(
        document.supplier.paymentMethods
      );
    setSupplier({
      isIndividual: document.supplier.isIndividual,
      country: document.supplier.country,
      name: document.supplier.name,
      regNum: document.supplier.regNum,
      vatNum: document.supplier.vatNum,
      address: document.supplier.address,
      email: document.supplier.email,
      url: document.supplier.url,
      phone: document.supplier.phone,
      comment: document.supplier.comment,
      note: document.supplier.note,
      language: document.supplier.language || document.language,
      currency: document.supplier.currency,
      duePeriod: document.supplier.duePeriod ?? NaN,
      lateFeeRate: document.supplier.lateFeeRate ?? NaN,
      vatRate: document.supplier.vatRate ?? NaN,
      isPartner: false,
      paymentMethods: supplierPaymentMethods
    });

    const recipientPaymentMethods =
      mapPaymentMethodsToCreatePaymentMethodModelRows(
        document.recipient.paymentMethods
      );
    setRecipient({
      isIndividual: document.recipient.isIndividual,
      country: document.recipient.country,
      name: document.recipient.name,
      regNum: document.recipient.regNum,
      vatNum: document.recipient.vatNum,
      address: document.recipient.address,
      email: document.recipient.email,
      url: document.recipient.url,
      phone: document.recipient.phone,
      comment: document.recipient.comment,
      note: document.recipient.note,
      language: document.recipient.language || document.language,
      currency: document.recipient.currency,
      duePeriod: document.recipient.duePeriod ?? NaN,
      lateFeeRate: document.recipient.lateFeeRate ?? NaN,
      vatRate: document.recipient.vatRate ?? NaN,
      isPartner: false,
      paymentMethods: recipientPaymentMethods
    });

    const items = document.items.map<CreateItemModelRow>((item) => {
      const { id, sku, name, description, unit, quantity, currency } = item;
      const { basePrice, discountRate, discountValue } = item;
      const { netPrice, vatRate, vatValue, grossPrice } = item;
      const { baseTotal, discountTotal } = item;
      const { netTotal, vatTotal, grossTotal } = item;

      return {
        rowId: id,
        sku,
        name,
        description,
        unit,
        quantity,
        currency,
        basePrice,
        discountRate,
        discountValue,
        netPrice,
        vatRate: vatRate ?? NaN,
        vatValue,
        grossPrice,
        baseTotal,
        discountTotal,
        netTotal,
        vatTotal,
        grossTotal
      };
    });
    setItems(items);

    setSupplierSignatureName(document.supplierSignatureName);
    setSupplierSignatureDate(document.supplierSignatureDate);
    setSupplierSignatureHasLine(document.supplierSignatureHasLine);
    setRecipientSignatureName(document.recipientSignatureName);
    setRecipientSignatureDate(document.recipientSignatureDate);
    setRecipientSignatureHasLine(document.recipientSignatureHasLine);

    const vats = [...new Set(items.map((item) => item.vatRate))];
    if (vats.length > 1) {
      setMultipleVat(true);
      setVatRate(company.vatRate ?? NaN);
    } else {
      setMultipleVat(false);
      setVatRate(vats.at(0) ?? NaN);
    }

    const discounts = [...new Set(items.map((item) => item.discountRate))];
    if (vats.length > 1) {
      setMultipleDiscount(true);
      setDiscountRate(0);
    } else {
      setMultipleDiscount(false);
      setDiscountRate(discounts.at(0) ?? 0);
    }
    setCurrencyRate(document.currencyRate);
    setShowCurrencyRate(document.showCurrencyRate);
    setPaymentMethodType(document.paymentMethodType);

    setShowCarrier(document.showCarrier);
    const country = countries.find(
      ({ iso2 }) => iso2 === document.carrierCountry
    );
    setCarrierCountry(country || DEFAULT_COUNTRY);
    setCarrierName(document.carrierName);
    setCarrierRegNum(document.carrierRegNum);
    setDriver(document.driver);
    setVehicle(document.vehicle);
    setVehicleNum(document.vehicleNum);
    setOriginAddress(document.originAddress);
    setDestinationAddress(document.destinationAddress);
    setCarrierName(document.carrierName);

    const fromDocuments =
      document.fromDocuments.map<CreateDocumentSettlementRow>((document) => {
        return {
          rowId: uuidv4(),
          fromDocument: document.fromDocument,
          amount: document.amount
        };
      });
    setFromDocuments(fromDocuments);
  }, [document]);

  useEffect(() => {
    if (!isCopy) return;
    getDocumentSettingsAction(type)
      .then((res) => {
        if (!res.data) return;
        const nextDocNum = formatDocNum(res.data.docNum, res.data.index);
        setDocNum(nextDocNum);
      })
      .catch(() => {});
  }, [isCopy, type]);

  return (
    <DocumentForm
      documentObject={isCopy ? undefined : document}
      company={company}
      companyLogo={companyLogo}
      documentLogo={documentLogo}
      units={units}
      documentEvents={documentEvents}
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
      saveRecordAction={updateDocument}
    />
  );
}
