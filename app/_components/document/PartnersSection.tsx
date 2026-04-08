"use client";

import { Fragment, ReactNode, useContext, useState } from "react";
import { LocaleContext } from "../context/LocaleProvider";
import { CreateCompanyModel } from "@/app/_lib/types/company";
import { SetState } from "@/app/_lib/types/general";
import { cn } from "@/app/_shadcn/lib/utils";
import PartnerDialog from "./PartnerDialog";
import { Language, PaymentMethodType } from "@/app/_prisma/enums";
import { Company } from "@/app/_prisma/browser";

interface ComponentProps {
  company: Company;
  supplierInput: [CreateCompanyModel, SetState<CreateCompanyModel>];
  recipientInput: [CreateCompanyModel, SetState<CreateCompanyModel>];
  setLanguage: SetState<Language>;
  color: string;
}

export default function PartnersSection({
  company,
  supplierInput,
  recipientInput,
  setLanguage,
  color
}: ComponentProps) {
  const { dict } = useContext(LocaleContext);
  const [supplier] = supplierInput;
  const [recipient] = recipientInput;

  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [isRecipientOpen, setIsRecipientOpen] = useState(false);

  const paymentMethodsCount = Math.max(
    supplier.paymentMethods?.length || 0,
    recipient.paymentMethods?.length || 0
  );

  const paymentMethodRows = Array.from(
    { length: paymentMethodsCount },
    (_, i) => {
      return {
        supplierMethod: supplier.paymentMethods?.[i],
        recipientMethod: recipient.paymentMethods?.[i],
        rowKey:
          supplier.paymentMethods?.[i]?.rowId ||
          recipient.paymentMethods?.[i]?.rowId ||
          i
      };
    }
  );

  // function handleRecipientPartnerSelect(option: CompanyWithMethods) {
  //   const partnerLanguage =
  //     option.language ?? company.language ?? DEFAULT_LANGUAGE;
  //   setLanguage(partnerLanguage);
  // }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4 items-stretch">
      <PartnerDialog
        isOpen={isSupplierOpen}
        setIsOpen={setIsSupplierOpen}
        partnerInput={supplierInput}
      />
      <PartnerDialog
        isOpen={isRecipientOpen}
        setIsOpen={setIsRecipientOpen}
        partnerInput={recipientInput}
        isRecipient={true}
        company={company}
        setLanguage={setLanguage}
      />
      <div className="pb-2">
        <div
          className={`p-4 text-lg text-[${color}] border-b border-[${color}]`}
        >
          {dict.labels.supplier}
        </div>
      </div>
      <div className="pb-2">
        <div
          className={`p-4 text-lg text-[${color}] border-b border-[${color}]`}
        >
          {dict.labels.recipient}
        </div>
      </div>
      <DocumentCard onClick={() => setIsSupplierOpen(true)}>
        <PartnerMainCard
          name={supplier.name}
          regNum={supplier.regNum}
          vatNum={supplier.vatNum}
          address={supplier.address}
          isIndividual={supplier.isIndividual}
        />
      </DocumentCard>
      <DocumentCard onClick={() => setIsRecipientOpen(true)}>
        <PartnerMainCard
          name={recipient.name}
          regNum={recipient.regNum}
          vatNum={recipient.vatNum}
          address={recipient.address}
          isIndividual={recipient.isIndividual}
        />
      </DocumentCard>
      <DocumentCard onClick={() => setIsSupplierOpen(true)}>
        <PartnerContactsCard
          email={supplier.email}
          url={supplier.url}
          phone={supplier.phone}
        />
      </DocumentCard>
      <DocumentCard onClick={() => setIsRecipientOpen(true)}>
        <PartnerContactsCard
          email={recipient.email}
          url={recipient.url}
          phone={recipient.phone}
        />
      </DocumentCard>

      {paymentMethodRows.map(({ supplierMethod, recipientMethod, rowKey }) => {
        return (
          <Fragment key={rowKey}>
            {supplierMethod ? (
              <DocumentCard onClick={() => setIsSupplierOpen(true)}>
                <PaymentMethodCard
                  type={supplierMethod.type}
                  name={supplierMethod.name}
                  accNum={supplierMethod.accNum}
                />
              </DocumentCard>
            ) : (
              <div />
            )}
            {recipientMethod ? (
              <DocumentCard onClick={() => setIsRecipientOpen(true)}>
                <PaymentMethodCard
                  type={recipientMethod.type}
                  name={recipientMethod.name}
                  accNum={recipientMethod.accNum}
                />
              </DocumentCard>
            ) : (
              <div />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

interface DataRowProps {
  className?: string;
  value: string;
  placeholder: string;
}

function DataRow({ className, value, placeholder }: DataRowProps) {
  return (
    <div className={cn({ "text-secondary-foreground": !value }, className)}>
      {value || placeholder}
    </div>
  );
}

interface DocumentCardProps {
  children: ReactNode;
  onClick: () => void;
}

function DocumentCard({ children, onClick }: DocumentCardProps) {
  return (
    <div
      className="p-8 h-full flex flex-col gap-2 rounded-3xl border border-border hover:bg-hover cursor-pointer"
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface PartnerMainCardProps {
  isIndividual: boolean;
  name: string;
  regNum: string;
  vatNum: string;
  address: string;
}

function PartnerMainCard({
  isIndividual,
  name,
  regNum,
  vatNum,
  address
}: PartnerMainCardProps) {
  const { dict } = useContext(LocaleContext);

  return (
    <>
      <DataRow
        className="font-medium"
        value={name}
        placeholder={dict.labels.companyName}
      />
      <DataRow
        value={regNum}
        placeholder={
          isIndividual ? dict.labels.idNumber : dict.labels.regNumber
        }
      />
      <DataRow value={vatNum} placeholder={dict.labels.vatNumber} />
      <DataRow value={address} placeholder={dict.labels.address} />
    </>
  );
}

interface PartnerContactsCardProps {
  email: string;
  url: string;
  phone: string;
}

function PartnerContactsCard({ email, url, phone }: PartnerContactsCardProps) {
  const { dict } = useContext(LocaleContext);

  return (
    <>
      <DataRow value={email} placeholder={dict.labels.email} />
      <DataRow value={url} placeholder={dict.labels.homepageUrl} />
      <DataRow value={phone} placeholder={dict.labels.phoneNumber} />
    </>
  );
}

interface PaymentMethodCardProps {
  type: PaymentMethodType;
  name: string;
  accNum: string;
}

function PaymentMethodCard({ type, name, accNum }: PaymentMethodCardProps) {
  const { dict } = useContext(LocaleContext);

  return (
    <>
      <DataRow
        value={dict.paymentMethodType[type]}
        placeholder={dict.labels.type}
      />
      <DataRow value={name} placeholder={dict.labels.itemName} />
      <DataRow
        value={accNum}
        placeholder={dict.paymentMethod.accNumOrId[type]}
      />
    </>
  );
}
