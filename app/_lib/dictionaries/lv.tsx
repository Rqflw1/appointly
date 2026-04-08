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
    add: "Pievienot",
    save: "Saglabāt",
    edit: "Rediģēt",
    copy: "Kopēt",
    download: "Lejupielādēt",
    exportXml: "Eksportēt XML",
    exportAll: "Eksportēt visu",
    import: "Importēt",
    print: "Drukāt",
    send: "Sūtīt",
    check: "Pārbaudīt",
    clear: "Notīrīt",
    useCompanyLogo: "Izmantot uzņēmuma logo",
    sendViaEmail: "Sūtīt pa e-pastu",
    sendTestEmail: "Sūtīt testa e-pastu",
    convertTo: "Pārveidot uz",
    changeRoleTo: "Mainīt lomu uz",
    revokeAccess: "Atsaukt piekļuvi",
    delete: "Dzēst",
    report: "Atskaite",
    inviteUser: "Uzaicināt lietotāju",
    editInvitation: "Rediģēt uzaicinājumu",
    addPaymentMethod: "Pievienot maksājuma metodi",
    addMethod: "Pievienot metodi",
    editMethod: "Rediģēt metodi",
    addItem: "Pievienot pozīciju",
    editItem: "Rediģēt pozīciju",
    addUnit: "Pievienot vienību",
    editUnit: "Rediģēt vienību",
    addPartner: "Pievienot partneri",
    editPartner: "Rediģēt partneri",
    select: "Izvēlēties",
    search: "Meklēt",
    pickADate: "Izvēlēties datumu",
    signIn: "Pierakstīties",
    signUp: "Reģistrēties",
    signOut: "Izrakstīties",
    selectCompany: "Izvēlēties uzņēmumu",
    addCompany: "Pievienot uzņēmumu",
    changePassword: "Mainīt paroli",
    deleteAccount: "Dzēst kontu",
    accept: "Pieņemt",
    reject: "Noraidīt",
    createOrUpdatePartner:
      "Izveidot vai atjaunināt partneri (vispārīga informācija, iestatījumi un maksājuma metodes)",
    addPrepaymentInvoice: "Pievienot priekšapmaksas rēķinu",
    enterEmail: "Ievadiet e-pastu, lai saņemtu verifikācijas kodu.",
    enterCode: "Ievadiet kodu, kas nosūtīts uz",
    sendCode: "Nosūtīt kodu",
    submit: "Iesniegt",
    resendCode: "Nosūtīt kodu atkārtoti",
    createNewPassword:
      "Izveidojiet jaunu paroli, lai atjaunotu piekļuvi kontam.",
    confirmAction: "Apstiprināt darbību",
    clickOrDragAndDrop:
      "Noklikšķiniet, lai augšupielādētu, vai velciet un nometiet failu",
    //
    forgotYourPassword: "Aizmirsāt paroli?",
    dontHaveAnAccount: "Nav konta?",
    alreadyHaveAnAccount: "Jau ir konts?",
    permanentlyDelete: "Vai tiešām vēlaties dzēst šo ierakstu?",
    permanentlyRevokeAccess: "Vai tiešām vēlaties atsaukt lietotāja piekļuvi?",
    //
    document: "Dokuments",
    documents: "Dokumenti",
    items: "Pozīcijas",
    partners: "Partneri",
    companies: "Uzņēmumi",
    companySettings: "Uzņēmuma iestatījumi",
    allCompanies: "Visi uzņēmumi",
    profile: "Profils",
    languageSettings: "Valodas iestatījumi",
    appearance: "Izskats",
    documentSettings: "Dokumentu iestatījumi",
    emailSettings: "E-pasta iestatījumi",
    smtp: "SMTP",
    paymentType: "Maksājuma veids",
    otherPaymentType: "Cits maksājuma veids",
    paymentMethod: "Maksājuma metode",
    paymentMethods: "Maksājuma metodes",
    showByDefault: "Rādīt pēc noklusējuma",
    users: "Lietotāji",
    privacyPolicy: "Privātuma politika",
    termsOfService: "Pakalpojumu noteikumi",
    invitation: "Uzaicinājums",
    invitations: "Uzaicinājumi",
    invitationLink: "Uzaicinājuma saite",
    loading: "Notiek ielāde",
    success: "Veiksmīgi",
    general: "Vispārīgi",
    generalSettings: "Vispārīgie iestatījumi",
    none: "Nav",
    rowsPerPage: "rindas lapā",
    noResults: "Nav rezultātu",
    noCompanies: "Nav uzņēmumu",
    allowedFileTypes: "Atļautie failu tipi",
    allRightsReserved: "Visas tiesības aizsargātas",
    sameDay: "Tajā pašā dienā",
    days: "diena(s)",
    preview: "Priekšskatījums",
    email: "E-pasts",
    history: "Vēsture",
    password: "Parole",
    confirmPassword: "Apstiprināt paroli",
    currentPassword: "Pašreizējā parole",
    newPassword: "Jaunā parole",
    itemName: "Nosaukums",
    name: "Vārds",
    surname: "Uzvārds",
    id: "ID",
    documentNumber: "Dokumenta numurs",
    documentDate: "Dokumenta datums",
    documentPeriod: "Dokumenta periods",
    dueDate: "Apmaksas termiņš",
    duePeriod: "Apmaksas periods",
    lateFeeRate: "Kavējuma maksa (dienā)",
    logo: "Logo",
    deleteLogo: "Notīrīt logo",
    documentNumberAndDate: "Dokumenta numurs un datums",
    supplier: "Piegādātājs",
    recipient: "Saņēmējs",
    carrier: "Pārvadātājs",
    status: "Statuss",
    signature: "Paraksts",
    date: "Datums",
    unit: "Vienība",
    units: "Vienības",
    quantity: "Daudzums",
    priceWithoutVat: "Cena bez PVN",
    price: "Cena",
    basePrice: "Pamatcena",
    discountRate: "Atlaides likme",
    discountValue: "Atlaides summa",
    discount: "Atlaide",
    vat: "PVN",
    rate: "likme",
    vatRate: "PVN likme",
    vatValue: "PVN summa",
    withoutVat: "Bez PVN",
    withoutVatLowercase: "bez PVN",
    multipleDiscountRates: "Vairāki atlaides likmju veidi",
    multipleVatRates: "Vairāki PVN likmju veidi",
    subtotal: "Starpsumma",
    totalBeforeDiscount: "Summa pirms atlaides",
    totalWithoutVat: "Summa bez PVN",
    total: "Summa",
    totalInWords: "Summa vārdiem",
    totalAmount: "Kopējā summa",
    amount: "Summa",
    language: "Valoda",
    currency: "Valūta",
    newDocument: "Jauns dokuments",
    type: "Tips",
    documentType: "Dokumenta veids",
    note: "Piezīme",
    comment: "Komentārs",
    noRecipient: "Nav saņēmēja",
    description: "Apraksts",
    sku: "Produkta kods (SKU)",
    country: "Valsts",
    companyName: "Uzņēmuma nosaukums",
    idNumber: "Identifikācijas numurs",
    idNo: "Identifikācijas nr.",
    regNumber: "Reģistrācijas numurs",
    regNo: "Reģ. nr.",
    vatNumber: "PVN numurs",
    vatNo: "PVN nr.",
    address: "Adrese",
    role: "Loma",
    homepageUrl: "Mājaslapas URL",
    phone: "Tālrunis",
    phoneNumber: "Tālruņa numurs",
    phoneNo: "Tālruņa nr.",
    accNumOrId: "Konta numurs vai ID",
    color: "Krāsa",
    host: "Hosts",
    user: "Lietotājs",
    subject: "Tēma",
    message: "Ziņojums",
    to: "Kam",
    cc: "Kopija",
    settings: "Iestatījumi",
    settingsLowercase: "iestatījumi",
    documentNumberFormat: "Dokumenta numura formāts",
    indexRefreshRate: "Indeksa atjaunošanas biežums",
    minIndexLength: "Minimālais indeksa garums",
    currentIndex: "Pašreizējais indekss",
    all: "Visi",
    filters: "Filtri",
    companyInformation: "Informācija par uzņēmumu",
    contactInformation: "Kontaktinformācija",
    vehicleInformation: "Transporta informācija",
    addressInformation: "Adreses informācija",
    originAddress: "Izcelsmes adrese",
    destinationAddress: "Galamērķa adrese",
    userInformation: "Lietotāja informācija",
    smtpSettings: "SMTP iestatījumi",
    emailSettingsLowercase: "e-pasta iestatījumi",
    analytics: "Analītika",
    signatureLine: "Paraksta rinda",
    validWithoutSignature:
      "Dokuments sagatavots elektroniski un ir derīgs bez paraksta",
    showElectronicSignatureNotice:
      "Rādīt paziņojumu par elektronisko parakstu",
    electronicSignatureNotice:
      "DOKUMENTS IR PARAKSTĪTS AR DROŠU ELEKTRONISKO PARAKSTU UN SATUR LAIKA ZĪMOGU",
    exchangeRate: "Valūtas kurss",
    showCurrencyRate: "Rādīt valūtas kursu PDF",
    showCarrier: "Rādīt pārvadātāju PDF",
    driver: "Vadītājs",
    vehicleModel: "Transportlīdzekļa modelis",
    vehicleNumber: "Transportlīdzekļa numurs",
    individual: "Privātpersona",
    business: "Uzņēmums",
    companyIsVat: "Uzņēmums ir PVN maksātājs",
    cantDetermineVat: "Nevar noteikt PVN maksātāja statusu",
    passwordRecovery: "Paroles atjaunošana",
    code: "Verifikācijas kods",
    codeSent: "Kods tika nosūtīts. Lūdzu, mēģiniet vēlāk."
  },
  texts: {
    agreeToTerms: (
      <>
        <span>Es piekrītu</span>
        <a
          href="/terms-of-service"
          target="_blank"
          className="mx-1 underline-offset-2 underline"
        >
          Pakalpojumu noteikumiem
        </a>
        <span>un</span>
        <a
          href="/privacy-policy"
          target="_blank"
          className="ml-1 underline-offset-2 underline"
        >
          Privātuma politikai
        </a>
      </>
    ),
    rowSelected: (selectedQty: number, allQty: number) =>
      `${selectedQty} no ${allQty} rindu atlasītas.`,
    pageSelected: (pageNum: number, pageQty: number) =>
      `Lapa ${pageNum} no ${pageQty}`,
    nonTaxable: (nonTaxableNetTotal: number, currency: string) =>
      `Neapliekama summa ${amountWithCurrency(
        toFixed(nonTaxableNetTotal, 2),
        currency
      )}`,
    vatFrom: (vatRate: number, taxableNetTotal: number, currency: string) =>
      `PVN ${round(vatRate * 100, 2)}% no ${amountWithCurrency(
        toFixed(taxableNetTotal, 2),
        currency
      )}`,
    vatFromWithInput: (
      vatRate: ReactNode,
      taxableNetTotal: number,
      currency: string
    ) => (
      <div className="flex items-center gap-2">
        <div>{`PVN`}</div>
        <div>{vatRate}</div>
        <div>{`no ${amountWithCurrency(
          toFixed(taxableNetTotal, 2),
          currency
        )}`}</div>
      </div>
    ),
    lateFee: (language: Language) =>
      `Kavējuma maksa ${formatDate(new Date(), language)}`,
    prepaymentInvoiceWithId: (id: string) => `Priekšapmaksas rēķins ${id}`,
    youHaveBeenInvited: (name: string, role: string) => (
      <>
        <span>Jūs esat uzaicināts pievienoties</span>
        <span className="mx-1 font-semibold">{name}</span>
        <span>uzņēmuma darba videi kā</span>
        <span className="ml-1 font-semibold">{role}</span>
      </>
    )
  },
  errors: {
    unexpectedError: "Nezināma kļūda",
    //
    nameIsRequired: "Vārds ir obligāts",
    surnameIsRequired: "Uzvārds ir obligāts",
    typeIsRequired: "Tips ir obligāts",
    documentIdRequired: "Dokuments ir obligāts",
    //
    invalidEmailOrPassword: "Nepareizs e-pasts vai parole",
    invalidEmail: "Nederīgs e-pasts",
    invalidUrl: "Nederīgs URL",
    invalidPassword: "Nederīga parole",
    invalidCode: "Nederīgs kods",
    invalidColor: "Nederīga krāsa",
    //
    userDoesNotExist: "Lietotājs ar šo e-pastu neeksistē",
    passwordMustContain:
      "Parolei jābūt vismaz 8 rakstzīmēm un jāietver vismaz 1 mazais burts, 1 lielais burts un 1 cipars. Atļautie simboli: a-z, A-Z, 0-9 un !@#$%^&*()_+=[]{}|;:'\",.<>/?`~-",
    passwordsDontMatch: "Paroles nesakrīt",
    userAlreadyExists: "Lietotājs ar šo e-pastu jau eksistē",
    youMustAgree:
      "Jums jāpiekrīt Pakalpojumu noteikumiem un Privātuma politikai",
    currentIndexMustBe: "Pašreizējam indeksam jābūt lielākam vai vienādam ar 0",
    amountMustBe: "Summai jābūt lielākai par 0"
  },
  documentType: {
    [DocumentType.INVOICE]: "Rēķins",
    [DocumentType.WAYBILL]: "Pavadzīme",
    [DocumentType.PREPAYMENT]: "Priekšapmaksas rēķins",
    [DocumentType.DEBIT_NOTE]: "Debeta rēķins"
  },
  documentTypePlural: {
    [DocumentType.INVOICE]: "Rēķini",
    [DocumentType.WAYBILL]: "Pavadzīmes",
    [DocumentType.PREPAYMENT]: "Priekšapmaksas rēķini",
    [DocumentType.DEBIT_NOTE]: "Debeta rēķini"
  },
  documentStatus: {
    [DocumentStatus.DRAFT]: "Melnraksts",
    [DocumentStatus.READY]: "Gatavs",
    [DocumentStatus.SENT]: "Nosūtīts",
    [DocumentStatus.PAID]: "Apmaksāts"
  },
  documentEventType: {
    [DocumentEventType.CREATE]: "Dokuments veiksmīgi izveidots",
    [DocumentEventType.UPDATE]: "Dokuments veiksmīgi atjaunināts",
    [DocumentEventType.SEND]: "Dokuments veiksmīgi nosūtīts",
    [DocumentEventType.DOWNLOAD]: "Dokuments veiksmīgi lejupielādēts"
  },
  signatureType: {
    [SignatureType.WITHOUT_SIGNATURE]: "Bez paraksta",
    [SignatureType.ONLY_SUPPLIER_SIGNATURE]: "Tikai piegādātāja paraksts",
    [SignatureType.BOTH_SIGNATURES]: "Abu pušu paraksti"
  },
  userAccessLevel: {
    [UserAccessLevel.OWNER]: "Īpašnieks",
    [UserAccessLevel.ADMIN]: "Administrators",
    [UserAccessLevel.MANAGER]: "Vadītājs",
    [UserAccessLevel.VIEWER]: "Skatītājs"
  },
  paymentMethodType: {
    [PaymentMethodType.BANK]: "Banka",
    [PaymentMethodType.CARD]: "Karte",
    [PaymentMethodType.CASH]: "Skaidrā nauda",
    [PaymentMethodType.ONLINE]: "Tiešsaistē",
    [PaymentMethodType.OTHER]: "Cits"
  },
  datePeriod: {
    THIS_MONTH: "Šis mēnesis",
    LAST_MONTH: "Pagājušais mēnesis",
    THIS_YEAR: "Šis gads",
    LAST_YEAR: "Pagājušais gads",
    ALL_TIME: "Visu laiku",
    CUSTOM: "Pielāgots"
  },
  language: {
    [Language.EN]: "Angļu",
    [Language.LV]: "Latviešu",
    [Language.RU]: "Krievu"
  },
  paymentMethod: {
    accNumOrId: {
      [PaymentMethodType.BANK]: "IBAN",
      [PaymentMethodType.CARD]: "Kartes numurs",
      [PaymentMethodType.CASH]: "Konta numurs vai ID",
      [PaymentMethodType.ONLINE]: "Konta numurs vai ID",
      [PaymentMethodType.OTHER]: "Konta numurs vai ID"
    },
    field_1: {
      [PaymentMethodType.BANK]: "Bankas adrese"
    }
  },
  documentNumber: {
    [DocumentType.INVOICE]: "Rēķina numurs",
    [DocumentType.WAYBILL]: "Pavadzīmes numurs",
    [DocumentType.PREPAYMENT]: "Priekšapmaksas rēķina numurs",
    [DocumentType.DEBIT_NOTE]: "Debeta rēķina numurs"
  },
  documentPeriod: {
    [DocumentType.INVOICE]: "Rēķina periods",
    [DocumentType.WAYBILL]: "Pavadzīmes periods",
    [DocumentType.PREPAYMENT]: "Priekšapmaksas rēķina periods",
    [DocumentType.DEBIT_NOTE]: "Debeta rēķina periods"
  },
  documentDate: {
    [DocumentType.INVOICE]: "Rēķina datums",
    [DocumentType.WAYBILL]: "Pavadzīmes datums",
    [DocumentType.PREPAYMENT]: "Priekšapmaksas rēķina datums",
    [DocumentType.DEBIT_NOTE]: "Debeta rēķina datums"
  }
};
