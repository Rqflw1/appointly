import {
  DocumentStatus,
  DocumentType,
  DocumentEventType,
  Language,
  PaymentMethodType,
  SignatureType,
  UserAccessLevel
} from "@/app/_prisma/enums";
import { formatDate, round, toFixed } from "../functions/general";
import { ReactNode } from "react";
import { amountWithCurrency } from "../functions/document";

export default {
  labels: {
    add: "Add",
    save: "Save",
    edit: "Edit",
    copy: "Copy",
    download: "Download",
    exportXml: "Export XML",
    exportAll: "Export all",
    import: "Import",
    print: "Print",
    send: "Send",
    check: "Check",
    clear: "Clear",
    useCompanyLogo: "Use company logo",
    sendViaEmail: "Send via email",
    sendTestEmail: "Send test email",
    convertTo: "Convert to",
    changeRoleTo: "Change role to",
    revokeAccess: "Revoke access",
    delete: "Delete",
    report: "Report",
    inviteUser: "Invite user",
    editInvitation: "Edit invitation",
    addPaymentMethod: "Add payment method",
    addMethod: "Add method",
    editMethod: "Edit method",
    addItem: "Add item",
    editItem: "Edit item",
    addUnit: "Add unit",
    editUnit: "Edit unit",
    addPartner: "Add partner",
    editPartner: "Edit partner",
    select: "Select",
    search: "Search",
    pickADate: "Pick a date",
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    selectCompany: "Select company",
    addCompany: "Add company",
    changePassword: "Change password",
    deleteAccount: "Delete account",
    accept: "Accept",
    reject: "Reject",
    createOrUpdatePartner:
      "Create or update partner (general info, settings and payment methods)",
    addPrepaymentInvoice: "Add prepayment invoice",
    enterEmail: "Enter your email to receive a verification code.",
    enterCode: "Enter the code sent to",
    sendCode: "Send code",
    submit: "Submit",
    resendCode: "Resend code",
    createNewPassword: "Create a new password to reset your account access.",
    confirmAction: "Confirm action",
    clickOrDragAndDrop: "Click to upload or drag and drop the file",
    //
    forgotYourPassword: "Forgot your password?",
    dontHaveAnAccount: "Don't have an account?",
    alreadyHaveAnAccount: "Already have an account?",
    permanentlyDelete:
      "Are you sure you want to permanently delete this record?",
    permanentlyRevokeAccess:
      "Are you sure you want to permanently revoke user's access?",
    //
    document: "Document",
    documents: "Documents",
    items: "Items",
    partners: "Partners",
    companies: "Companies",
    companySettings: "Company settings",
    allCompanies: "All companies",
    profile: "Profile",
    languageSettings: "Language settings",
    appearance: "Appearance",
    documentSettings: "Document settings",
    emailSettings: "Email settings",
    smtp: "SMTP",
    paymentType: "Payment type",
    otherPaymentType: "Other payment type",
    paymentMethod: "Payment method",
    paymentMethods: "Payment methods",
    showByDefault: "Show by default",
    users: "Users",
    privacyPolicy: "Privacy policy",
    termsOfService: "Terms of service",
    invitation: "Invitation",
    invitations: "Invitations",
    invitationLink: "Invitation link",
    loading: "Loading",
    success: "Success",
    general: "General",
    generalSettings: "General settings",
    none: "None",
    rowsPerPage: "rows per page",
    noResults: "No results",
    noCompanies: "No companies",
    allowedFileTypes: "Allowed file types",
    allRightsReserved: "All rights reserved",
    sameDay: "Same day",
    days: "day(s)",
    preview: "Preview",
    email: "Email",
    history: "History",
    password: "Password",
    confirmPassword: "Confirm password",
    currentPassword: "Current password",
    newPassword: "New password",
    itemName: "Name",
    name: "Name",
    surname: "Surname",
    id: "Id",
    documentNumber: "Document number",
    documentDate: "Document date",
    documentPeriod: "Document period",
    dueDate: "Due date",
    duePeriod: "Due period",
    lateFeeRate: "Late fee rate (per day)",
    logo: "Logo",
    deleteLogo: "Clear logo",
    documentNumberAndDate: "Document number and date",
    supplier: "Supplier",
    recipient: "Recipient",
    carrier: "Carrier",
    status: "Status",
    signature: "Signature",
    date: "Date",
    unit: "Unit",
    units: "Units",
    quantity: "Quantity",
    priceWithoutVat: "Price without VAT",
    price: "Price",
    basePrice: "Base price",
    discountRate: "Discount rate",
    discountValue: "Discount value",
    discount: "Discount",
    vat: "VAT",
    rate: "rate",
    vatRate: "VAT rate",
    vatValue: "VAT value",
    withoutVat: "Without VAT",
    withoutVatLowercase: "without VAT",
    multipleDiscountRates: "Multiple Discount rates",
    multipleVatRates: "Multiple VAT rates",
    subtotal: "Subtotal",
    totalBeforeDiscount: "Total before discount",
    totalWithoutVat: "Total without VAT",
    total: "Total",
    totalInWords: "Total in words",
    totalAmount: "Total amount",
    amount: "Amount",
    language: "Language",
    currency: "Currency",
    newDocument: "New document",
    type: "Type",
    documentType: "Document type",
    note: "Note",
    comment: "Comment",
    noRecipient: "No recipient",
    description: "Description",
    sku: "Product code (SKU)",
    country: "Country",
    companyName: "Company name",
    idNumber: "Identification number",
    idNo: "Identification no.",
    regNumber: "Registration number",
    regNo: "Reg. no.",
    vatNumber: "VAT number",
    vatNo: "VAT no.",
    address: "Address",
    role: "Role",
    homepageUrl: "Homepage URL",
    phone: "Phone",
    phoneNumber: "Phone number",
    phoneNo: "Phone no.",
    accNumOrId: "Account number or ID",
    color: "Color",
    host: "Host",
    user: "User",
    subject: "Subject",
    message: "Message",
    to: "To",
    cc: "Cc",
    settings: "Settings",
    settingsLowercase: "settings",
    documentNumberFormat: "Document number format",
    indexRefreshRate: "Index refresh rate",
    minIndexLength: "Minimum index length",
    currentIndex: "Current Index",
    all: "All",
    filters: "Filters",
    companyInformation: "Company information",
    contactInformation: "Contact information",
    vehicleInformation: "Vehicle information",
    addressInformation: "Address information",
    originAddress: "Origin address",
    destinationAddress: "Destination address",
    userInformation: "User information",
    smtpSettings: "SMTP settings",
    emailSettingsLowercase: "email settings",
    analytics: "Analytics",
    signatureLine: "Signature line",
    validWithoutSignature:
      "Document is drawn up electronically and is valid without signature",
    showElectronicSignatureNotice: "Show electronic signature notice",
    electronicSignatureNotice:
      "DOCUMENT IS SIGNED WITH A SECURE ELECTRONIC SIGNATURE AND CONTAINS A TIME STAMP",
    exchangeRate: "Exchange rate",
    showCurrencyRate: "Show exchange rate in PDF",
    showCarrier: "Show carrier in PDF",
    driver: "Driver",
    vehicleModel: "Vehicle model",
    vehicleNumber: "Vehicle number",
    individual: "Individual",
    business: "Business",
    companyIsVat: "Company is a VAT payer",
    cantDetermineVat: "We cannot determine the VAT payer status",
    passwordRecovery: "Password recovery",
    code: "Verification code",
    codeSent: "Code was sent. Please try again later."
  },
  texts: {
    agreeToTerms: (
      <>
        <span>I agree to the</span>
        <a
          href="/terms-of-service"
          target="_blank"
          className="mx-1 underline-offset-2 underline"
        >
          Terms of Service
        </a>
        <span>and</span>
        <a
          href="/privacy-policy"
          target="_blank"
          className="ml-1 underline-offset-2 underline"
        >
          Privacy Policy
        </a>
      </>
    ),
    rowSelected: (selectedQty: number, allQty: number) =>
      `${selectedQty} of ${allQty} row(s) selected.`,
    pageSelected: (pageNum: number, pageQty: number) =>
      `Page ${pageNum} of ${pageQty}`,
    nonTaxable: (nonTaxableNetTotal: number, currency: string) =>
      `Non-taxable amount ${amountWithCurrency(
        toFixed(nonTaxableNetTotal, 2),
        currency
      )}`,
    vatFrom: (vatRate: number, taxableNetTotal: number, currency: string) =>
      `VAT ${round(vatRate * 100, 2)}% from ${amountWithCurrency(
        toFixed(taxableNetTotal, 2),
        currency
      )}`,
    vatFromWithInput: (
      vatRate: ReactNode,
      taxableNetTotal: number,
      currency: string
    ) => (
      <div className="flex items-center gap-2">
        <div>{`VAT`}</div>
        <div>{vatRate}</div>
        <div>{`from ${amountWithCurrency(
          toFixed(taxableNetTotal, 2),
          currency
        )}`}</div>
      </div>
    ),
    lateFee: (language: Language) =>
      `Late fee on ${formatDate(new Date(), language)}`,
    prepaymentInvoiceWithId: (id: string) => `Prepayment invoice ${id}`,
    youHaveBeenInvited: (name: string, role: string) => (
      <>
        <span>You have been invited to join</span>
        <span className="mx-1 font-semibold">{name}</span>
        <span>company workspace as</span>
        <span className="ml-1 font-semibold">{role}</span>
      </>
    )
  },
  errors: {
    unexpectedError: "Unexpected error",
    //
    nameIsRequired: "Name is required",
    surnameIsRequired: "Surname is required",
    typeIsRequired: "Type is required",
    documentIdRequired: "Document is required",
    //
    invalidEmailOrPassword: "Invalid e-mail or password",
    invalidEmail: "Invalid email",
    invalidUrl: "Invalid URL",
    invalidPassword: "Invalid password",
    invalidCode: "Invalid code",
    invalidColor: "Invalid color",
    //
    userDoesNotExist: "User with this email does not exist",
    passwordMustContain:
      "Password must be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter and 1 number. Allowed symbols: a-z, A-Z, 0-9 and !@#$%^&*()_+=[]{}|;:'\",.<>/?`~-",
    passwordsDontMatch: "Passwords don't match",
    userAlreadyExists: "User with this email already exists",
    youMustAgree: "You must agree with Terms of Service and Privacy Policy",
    currentIndexMustBe: "Current index must be greater or equal to 0",
    amountMustBe: "Amount must be greater than 0"
  },
  documentType: {
    [DocumentType.INVOICE]: "Invoice",
    [DocumentType.WAYBILL]: "Waybill",
    [DocumentType.PREPAYMENT]: "Prepayment invoice",
    [DocumentType.DEBIT_NOTE]: "Debit note"
  },
  documentTypePlural: {
    [DocumentType.INVOICE]: "Invoices",
    [DocumentType.WAYBILL]: "Waybills",
    [DocumentType.PREPAYMENT]: "Prepayment invoices",
    [DocumentType.DEBIT_NOTE]: "Debit notes"
  },
  documentStatus: {
    [DocumentStatus.DRAFT]: "Draft",
    [DocumentStatus.READY]: "Ready",
    [DocumentStatus.SENT]: "Sent",
    [DocumentStatus.PAID]: "Paid"
  },
  documentEventType: {
    [DocumentEventType.CREATE]: "Document successfully created",
    [DocumentEventType.UPDATE]: "Document successfully updated",
    [DocumentEventType.SEND]: "Document successfully sent",
    [DocumentEventType.DOWNLOAD]: "Document successfully downloaded"
  },
  signatureType: {
    [SignatureType.WITHOUT_SIGNATURE]: "Without signature",
    [SignatureType.ONLY_SUPPLIER_SIGNATURE]: "Only supplier signature",
    [SignatureType.BOTH_SIGNATURES]: "Both signatures"
  },
  userAccessLevel: {
    [UserAccessLevel.OWNER]: "Owner",
    [UserAccessLevel.ADMIN]: "Admin",
    [UserAccessLevel.MANAGER]: "Manager",
    [UserAccessLevel.VIEWER]: "Viewer"
  },
  paymentMethodType: {
    [PaymentMethodType.BANK]: "Bank",
    [PaymentMethodType.CARD]: "Card",
    [PaymentMethodType.CASH]: "Cash",
    [PaymentMethodType.ONLINE]: "Online",
    [PaymentMethodType.OTHER]: "Other"
  },
  datePeriod: {
    THIS_MONTH: "This month",
    LAST_MONTH: "Last month",
    THIS_YEAR: "This year",
    LAST_YEAR: "Last year",
    ALL_TIME: "All time",
    CUSTOM: "Custom"
  },
  language: {
    [Language.EN]: "English",
    [Language.LV]: "Latvian",
    [Language.RU]: "Russian"
  },
  paymentMethod: {
    accNumOrId: {
      [PaymentMethodType.BANK]: "IBAN",
      [PaymentMethodType.CARD]: "Card number",
      [PaymentMethodType.CASH]: "Account number or ID",
      [PaymentMethodType.ONLINE]: "Account number or ID",
      [PaymentMethodType.OTHER]: "Account number or ID"
    },
    field_1: {
      [PaymentMethodType.BANK]: "Bank address"
    }
  },
  documentNumber: {
    [DocumentType.INVOICE]: "Invoice number",
    [DocumentType.WAYBILL]: "Waybill number",
    [DocumentType.PREPAYMENT]: "Prepayment invoice number",
    [DocumentType.DEBIT_NOTE]: "Debit note number"
  },
  documentPeriod: {
    [DocumentType.INVOICE]: "Invoice period",
    [DocumentType.WAYBILL]: "Waybill period",
    [DocumentType.PREPAYMENT]: "Prepayment invoice period",
    [DocumentType.DEBIT_NOTE]: "Debit note period"
  },
  documentDate: {
    [DocumentType.INVOICE]: "Invoice date",
    [DocumentType.WAYBILL]: "Waybill date",
    [DocumentType.PREPAYMENT]: "Prepayment invoice date",
    [DocumentType.DEBIT_NOTE]: "Debit note date"
  }
};
