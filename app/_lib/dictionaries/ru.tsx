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
    add: "Добавить",
    save: "Сохранить",
    edit: "Редактировать",
    copy: "Копировать",
    download: "Скачать",
    exportXml: "Экспорт XML",
    exportAll: "Экспорт все",
    import: "Импортировать",
    print: "Печать",
    send: "Отправить",
    check: "Проверить",
    clear: "Очистить",
    useCompanyLogo: "Использовать логотип компании",
    sendViaEmail: "Отправить по эл. почте",
    sendTestEmail: "Отправить тестовое письмо",
    convertTo: "Преобразовать в",
    changeRoleTo: "Сменить роль на",
    revokeAccess: "Отозвать доступ",
    delete: "Удалить",
    report: "Отчёт",
    inviteUser: "Пригласить пользователя",
    editInvitation: "Редактировать приглашение",
    addPaymentMethod: "Добавить способ оплаты",
    addMethod: "Добавить способ",
    editMethod: "Редактировать способ",
    addItem: "Добавить товар",
    editItem: "Редактировать товар",
    addUnit: "Добавить единицу",
    editUnit: "Редактировать единицу",
    addPartner: "Добавить партнёра",
    editPartner: "Редактировать партнёра",
    select: "Выбрать",
    search: "Поиск",
    pickADate: "Выберите дату",
    signIn: "Войти",
    signUp: "Регистрация",
    signOut: "Выйти",
    selectCompany: "Выбрать компанию",
    addCompany: "Добавить компанию",
    changePassword: "Сменить пароль",
    deleteAccount: "Удалить аккаунт",
    accept: "Принять",
    reject: "Отклонить",
    createOrUpdatePartner:
      "Создать или обновить партнёра (общая информация, настройки и способы оплаты)",
    addPrepaymentInvoice: "Добавить авансовый счёт",
    enterEmail: "Введите адрес эл. почты для получения кода подтверждения.",
    enterCode: "Введите код, отправленный на",
    sendCode: "Отправить код",
    submit: "Отправить",
    resendCode: "Отправить код повторно",
    createNewPassword:
      "Создайте новый пароль для восстановления доступа к аккаунту.",
    confirmAction: "Подтвердить действие",
    clickOrDragAndDrop: "Нажмите для загрузки или перетащите файл",
    //
    forgotYourPassword: "Забыли пароль?",
    dontHaveAnAccount: "Нет аккаунта?",
    alreadyHaveAnAccount: "Уже есть аккаунт?",
    permanentlyDelete:
      "Вы уверены, что хотите безвозвратно удалить эту запись?",
    permanentlyRevokeAccess:
      "Вы уверены, что хотите навсегда отозвать доступ пользователя?",
    //
    document: "Документ",
    documents: "Документы",
    items: "Товары",
    partners: "Партнёры",
    companies: "Компании",
    companySettings: "Настройки компании",
    allCompanies: "Все компании",
    profile: "Профиль",
    languageSettings: "Языковые настройки",
    appearance: "Внешний вид",
    documentSettings: "Настройки документов",
    emailSettings: "Настройки эл. почты",
    smtp: "SMTP",
    paymentType: "Тип оплаты",
    otherPaymentType: "Другой тип оплаты",
    paymentMethod: "Способ оплаты",
    paymentMethods: "Способы оплаты",
    showByDefault: "Показывать по умолчанию",
    users: "Пользователи",
    privacyPolicy: "Политика конфиденциальности",
    termsOfService: "Условия использования",
    invitation: "Приглашение",
    invitations: "Приглашения",
    invitationLink: "Ссылка-приглашение",
    loading: "Загрузка",
    success: "Успех",
    general: "Общее",
    generalSettings: "Общие настройки",
    none: "Нет",
    rowsPerPage: "строк на странице",
    noResults: "Нет результатов",
    noCompanies: "Нет компаний",
    allowedFileTypes: "Разрешённые типы файлов",
    allRightsReserved: "Все права защищены",
    sameDay: "В тот же день",
    days: "дн.",
    preview: "Предпросмотр",
    email: "Эл. почта",
    history: "История",
    password: "Пароль",
    confirmPassword: "Подтвердите пароль",
    currentPassword: "Текущий пароль",
    newPassword: "Новый пароль",
    itemName: "Название",
    name: "Имя",
    surname: "Фамилия",
    id: "Id",
    documentNumber: "Номер документа",
    documentDate: "Дата документа",
    documentPeriod: "Период документа",
    dueDate: "Срок оплаты",
    duePeriod: "Срок оплаты (дней)",
    lateFeeRate: "Пени (в день)",
    logo: "Логотип",
    deleteLogo: "Очистить логотип",
    documentNumberAndDate: "Номер и дата документа",
    supplier: "Поставщик",
    recipient: "Получатель",
    carrier: "Перевозчик",
    status: "Статус",
    signature: "Подпись",
    date: "Дата",
    unit: "Ед. измерения",
    units: "Единицы",
    quantity: "Количество",
    priceWithoutVat: "Цена без НДС",
    price: "Цена",
    basePrice: "Базовая цена",
    discountRate: "Скидка",
    discountValue: "Сумма скидки",
    discount: "Скидка",
    vat: "НДС",
    rate: "ставка",
    vatRate: "Ставка НДС",
    vatValue: "Сумма НДС",
    withoutVat: "Без НДС",
    withoutVatLowercase: "без НДС",
    multipleDiscountRates: "Разные ставки скидки",
    multipleVatRates: "Разные ставки НДС",
    subtotal: "Промежуточный итог",
    totalBeforeDiscount: "Итого до скидки",
    totalWithoutVat: "Итого без НДС",
    total: "Итого",
    totalInWords: "Сумма прописью",
    totalAmount: "Общая сумма",
    amount: "Сумма",
    language: "Язык",
    currency: "Валюта",
    newDocument: "Новый документ",
    type: "Тип",
    documentType: "Тип документа",
    note: "Примечание",
    comment: "Комментарий",
    noRecipient: "Получатель не указан",
    description: "Описание",
    sku: "Код товара (SKU)",
    country: "Страна",
    companyName: "Название компании",
    idNumber: "Идентификационный номер",
    idNo: "Ид. №",
    regNumber: "Регистрационный номер",
    regNo: "Рег. №",
    vatNumber: "Номер НДС",
    vatNo: "НДС №",
    address: "Адрес",
    role: "Роль",
    homepageUrl: "Сайт",
    phone: "Телефон",
    phoneNumber: "Номер телефона",
    phoneNo: "Тел. №",
    accNumOrId: "Номер счёта или ID",
    color: "Цвет",
    host: "Хост",
    user: "Пользователь",
    subject: "Тема",
    message: "Сообщение",
    to: "Кому",
    cc: "Копия",
    settings: "Настройки",
    settingsLowercase: "настройки",
    documentNumberFormat: "Формат номера документа",
    indexRefreshRate: "Частота обновления индекса",
    minIndexLength: "Минимальная длина индекса",
    currentIndex: "Текущий индекс",
    all: "Все",
    filters: "Фильтры",
    companyInformation: "Информация о компании",
    contactInformation: "Контактная информация",
    vehicleInformation: "Информация о транспорте",
    addressInformation: "Информация об адресе",
    originAddress: "Адрес отправления",
    destinationAddress: "Адрес назначения",
    userInformation: "Информация о пользователе",
    smtpSettings: "Настройки SMTP",
    emailSettingsLowercase: "настройки эл. почты",
    analytics: "Аналитика",
    signatureLine: "Линия подписи",
    validWithoutSignature:
      "Документ оформлен в электронном виде и действителен без подписи",
    showElectronicSignatureNotice:
      "Показывать уведомление об электронной подписи",
    electronicSignatureNotice:
      "ДОКУМЕНТ ПОДПИСАН НАДЕЖНОЙ ЭЛЕКТРОННОЙ ПОДПИСЬЮ И СОДЕРЖИТ МЕТКУ ВРЕМЕНИ",
    exchangeRate: "Курс обмена",
    showCurrencyRate: "Показывать курс в PDF",
    showCarrier: "Показывать перевозчика в PDF",
    driver: "Водитель",
    vehicleModel: "Модель ТС",
    vehicleNumber: "Номер ТС",
    individual: "Физ. лицо",
    business: "Юр. лицо",
    companyIsVat: "Компания является плательщиком НДС",
    cantDetermineVat: "Не удалось определить статус плательщика НДС",
    passwordRecovery: "Восстановление пароля",
    code: "Код подтверждения",
    codeSent: "Код отправлен. Пожалуйста, попробуйте позже."
  },
  texts: {
    agreeToTerms: (
      <>
        <span>Я согласен с</span>
        <a
          href="/terms-of-service"
          target="_blank"
          className="mx-1 underline-offset-2 underline"
        >
          Условиями использования
        </a>
        <span>и</span>
        <a
          href="/privacy-policy"
          target="_blank"
          className="ml-1 underline-offset-2 underline"
        >
          Политикой конфиденциальности
        </a>
      </>
    ),
    rowSelected: (selectedQty: number, allQty: number) =>
      `Выбрано ${selectedQty} из ${allQty} строк.`,
    pageSelected: (pageNum: number, pageQty: number) =>
      `Страница ${pageNum} из ${pageQty}`,
    nonTaxable: (nonTaxableNetTotal: number, currency: string) =>
      `Необлагаемая сумма ${amountWithCurrency(
        toFixed(nonTaxableNetTotal, 2),
        currency
      )}`,
    vatFrom: (vatRate: number, taxableNetTotal: number, currency: string) =>
      `НДС ${round(vatRate * 100, 2)}% от ${amountWithCurrency(
        toFixed(taxableNetTotal, 2),
        currency
      )}`,
    vatFromWithInput: (
      vatRate: ReactNode,
      taxableNetTotal: number,
      currency: string
    ) => (
      <div className="flex items-center gap-2">
        <div>{`НДС`}</div>
        <div>{vatRate}</div>
        <div>{`от ${amountWithCurrency(
          toFixed(taxableNetTotal, 2),
          currency
        )}`}</div>
      </div>
    ),
    lateFee: (language: Language) =>
      `Пени на ${formatDate(new Date(), language)}`,
    prepaymentInvoiceWithId: (id: string) => `Авансовый счёт ${id}`,
    youHaveBeenInvited: (name: string, role: string) => (
      <>
        <span>Вас пригласили присоединиться к компании</span>
        <span className="mx-1 font-semibold">{name}</span>
        <span>в роли</span>
        <span className="ml-1 font-semibold">{role}</span>
      </>
    )
  },
  errors: {
    unexpectedError: "Непредвиденная ошибка",
    //
    nameIsRequired: "Имя обязательно",
    surnameIsRequired: "Фамилия обязательна",
    typeIsRequired: "Тип обязателен",
    documentIdRequired: "Документ обязателен",
    //
    invalidEmailOrPassword: "Неверный адрес эл. почты или пароль",
    invalidEmail: "Неверный адрес эл. почты",
    invalidUrl: "Неверный URL",
    invalidPassword: "Неверный пароль",
    invalidCode: "Неверный код",
    invalidColor: "Неверный цвет",
    //
    userDoesNotExist: "Пользователь с таким адресом эл. почты не существует",
    passwordMustContain:
      "Пароль должен быть не менее 8 символов и содержать минимум 1 строчную букву, 1 заглавную букву и 1 цифру. Допустимые символы: a-z, A-Z, 0-9 и !@#$%^&*()_+=[]{}|;:'\",.<>/?`~-",
    passwordsDontMatch: "Пароли не совпадают",
    userAlreadyExists: "Пользователь с таким адресом эл. почты уже существует",
    youMustAgree:
      "Нужно согласиться с Условиями использования и Политикой конфиденциальности",
    currentIndexMustBe: "Текущий индекс должен быть больше или равен 0",
    amountMustBe: "Сумма должна быть больше 0"
  },
  documentType: {
    [DocumentType.INVOICE]: "Счёт",
    [DocumentType.WAYBILL]: "Накладная",
    [DocumentType.PREPAYMENT]: "Авансовый счёт",
    [DocumentType.DEBIT_NOTE]: "Дебетовая нота"
  },
  documentTypePlural: {
    [DocumentType.INVOICE]: "Счета",
    [DocumentType.WAYBILL]: "Накладные",
    [DocumentType.PREPAYMENT]: "Авансовые счета",
    [DocumentType.DEBIT_NOTE]: "Дебетовые ноты"
  },
  documentStatus: {
    [DocumentStatus.DRAFT]: "Черновик",
    [DocumentStatus.READY]: "Готов",
    [DocumentStatus.SENT]: "Отправлен",
    [DocumentStatus.PAID]: "Оплачен"
  },
  documentEventType: {
    [DocumentEventType.CREATE]: "Документ успешно создан",
    [DocumentEventType.UPDATE]: "Документ успешно обновлён",
    [DocumentEventType.SEND]: "Документ успешно отправлен",
    [DocumentEventType.DOWNLOAD]: "Документ успешно скачан"
  },
  signatureType: {
    [SignatureType.WITHOUT_SIGNATURE]: "Без подписи",
    [SignatureType.ONLY_SUPPLIER_SIGNATURE]: "Только подпись поставщика",
    [SignatureType.BOTH_SIGNATURES]: "Обе подписи"
  },
  userAccessLevel: {
    [UserAccessLevel.OWNER]: "Владелец",
    [UserAccessLevel.ADMIN]: "Администратор",
    [UserAccessLevel.MANAGER]: "Менеджер",
    [UserAccessLevel.VIEWER]: "Наблюдатель"
  },
  paymentMethodType: {
    [PaymentMethodType.BANK]: "Банк",
    [PaymentMethodType.CARD]: "Карта",
    [PaymentMethodType.CASH]: "Наличные",
    [PaymentMethodType.ONLINE]: "Онлайн",
    [PaymentMethodType.OTHER]: "Другое"
  },
  datePeriod: {
    THIS_MONTH: "Этот месяц",
    LAST_MONTH: "Прошлый месяц",
    THIS_YEAR: "Этот год",
    LAST_YEAR: "Прошлый год",
    ALL_TIME: "За всё время",
    CUSTOM: "Произвольно"
  },
  language: {
    [Language.EN]: "Английский",
    [Language.LV]: "Латышский",
    [Language.RU]: "Русский"
  },
  paymentMethod: {
    accNumOrId: {
      [PaymentMethodType.BANK]: "IBAN",
      [PaymentMethodType.CARD]: "Номер карты",
      [PaymentMethodType.CASH]: "Номер счёта или ID",
      [PaymentMethodType.ONLINE]: "Номер счёта или ID",
      [PaymentMethodType.OTHER]: "Номер счёта или ID"
    },
    field_1: {
      [PaymentMethodType.BANK]: "Адрес банка"
    }
  },
  documentNumber: {
    [DocumentType.INVOICE]: "Номер счета",
    [DocumentType.WAYBILL]: "Номер накладной",
    [DocumentType.PREPAYMENT]: "Номер авансового счета",
    [DocumentType.DEBIT_NOTE]: "Номер дебетовой ноты"
  },
  documentPeriod: {
    [DocumentType.INVOICE]: "Период счета",
    [DocumentType.WAYBILL]: "Период накладной",
    [DocumentType.PREPAYMENT]: "Период авансового счета",
    [DocumentType.DEBIT_NOTE]: "Период дебетовой ноты"
  },
  documentDate: {
    [DocumentType.INVOICE]: "Дата счета",
    [DocumentType.WAYBILL]: "Дата накладной",
    [DocumentType.PREPAYMENT]: "Дата авансового счета",
    [DocumentType.DEBIT_NOTE]: "Дата дебетовой ноты"
  }
};
