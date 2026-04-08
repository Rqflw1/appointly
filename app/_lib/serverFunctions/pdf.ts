import "server-only";

import PDFDocument from "pdfkit";
import {
  calculateDocumentTotals,
  formatDate,
  formatDateShortWithYear,
  getDictionary,
  getResult,
  toFixed
} from "../functions/general";
import { Writable } from "stream";
import { logger } from "../constants/logger";
import {
  DocumentType,
  Item,
  PaymentMethodType,
  SignatureType
} from "@/app/_prisma/browser";
import { DocumentWithChildren } from "../types/document";
import { Dictionary } from "../types/general";
import { NEXT_PUBLIC_BASE_URL, SCW_BUCKET } from "../constants/general";
import { CompanyWithMethods } from "../types/company";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/scaleway/s3";
import z from "zod";
import { amountToWords, amountWithCurrency } from "../functions/document";
import doc from "pdfkit";

// PDF width = 595.28
// PDF height = 841.89

const black = "#000000";
const purple = "#8243e5";
const grey_1 = "#6f6f6f";
const grey_2 = "#e4e4e4";
const grey_3 = "#f5f5f5";

const x1 = 50;
const x2 = 60;
const x3 = 305;
const x4 = 315;

const width_1 = 225;
const width_2 = 245;
const width_3 = 480;

const partnerLabelWidth = 80;
const labelOptions = { width: partnerLabelWidth };
const valueOptions: PDFKit.Mixins.TextOptions = {
  width: width_1 - partnerLabelWidth,
  align: "right"
};
const valueX2 = x2 + partnerLabelWidth;
const valueX4 = x4 + partnerLabelWidth;

export async function generateDocumentPdf(document: DocumentWithChildren) {
  try {
    const { pdfDoc, writableStream, chunks } = createDocument();

    const isRu = document.language === "RU";
    const normalFont = isRu ? "DejaVuSans.ttf" : "Poppins.ttf";
    const boldFont = isRu ? "DejaVuSans-Bold.ttf" : "Poppins-SemiBold.ttf";

    await registerFont(pdfDoc, normalFont, "Normal");
    await registerFont(pdfDoc, boldFont, "Bold");

    const dict = getDictionary(document.language);
    await drawDocument(pdfDoc, dict, document);

    const buffer = await endDocument(pdfDoc, writableStream, chunks);
    return getResult(true, 0, buffer);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}

// ----------------------------------------------------------------------------

function createDocument() {
  const chunks: Uint8Array[] = [];
  const writableStream = new Writable({
    write(chunk, _, callback) {
      chunks.push(chunk);
      callback();
    }
  });
  const pdfDoc = new PDFDocument({
    size: "A4",
    layout: "portrait",
    autoFirstPage: false,
    bufferPages: true,
    margins: { bottom: 0, top: 0, left: 0, right: 0 }
  });
  pdfDoc.pipe(writableStream);

  return { pdfDoc, writableStream, chunks };
}

async function endDocument(
  pdfDoc: typeof PDFDocument,
  writableStream: Writable,
  chunks: Uint8Array[]
) {
  pdfDoc.end();

  await new Promise((resolve, reject) => {
    writableStream.on("finish", resolve);
    writableStream.on("error", reject);
  });

  return Buffer.concat(chunks);
}

async function registerFont(
  pdfDoc: typeof PDFDocument,
  filename: string,
  alias: string
) {
  const bytes = await fetch(`${NEXT_PUBLIC_BASE_URL}/fonts/${filename}`).then(
    (res) => res.arrayBuffer()
  );
  pdfDoc.registerFont(alias, bytes);
}

async function getImageBytes(path: string) {
  return await fetch(`${NEXT_PUBLIC_BASE_URL}${path}`).then((res) =>
    res.arrayBuffer()
  );
}

function drawLine(
  pdfDoc: typeof PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) {
  pdfDoc.save().fillColor(color).rect(x, y, width, height).fill().restore();
}

// ----------------------------------------------------------------------------

async function drawDocument(
  pdfDoc: typeof PDFDocument,
  dict: Dictionary,
  document: DocumentWithChildren
) {
  pdfDoc.addPage();
  let y = 0;
  y = await drawDocumentHeader(pdfDoc, dict, document);

  y = y + 30;
  let borderY = y;
  y = y + 10;
  let i = 0;
  while (true) {
    const res = drawTable(pdfDoc, dict, document, y, i);
    i = res.itemIndex;
    y = res.y;
    y = y + 10;
    if (i === document.items.length) break;
    pdfDoc.strokeColor(grey_2);
    pdfDoc.roundedRect(x1, borderY, 500, y - borderY, 10).stroke();
    pdfDoc.addPage();
    borderY = 40;
    y = 60;
  }

  const totalBlockHeight = getTotalBlockHeight(pdfDoc, document);
  if (y + totalBlockHeight > 770) {
    pdfDoc.strokeColor(grey_2);
    pdfDoc.roundedRect(x1, borderY, 500, y - borderY, 10).stroke();
    pdfDoc.addPage();
    borderY = 40;
    y = 50;
  }
  y = drawTotal(pdfDoc, dict, document, y);
  y = y + 10;
  pdfDoc.strokeColor(grey_2);
  pdfDoc.roundedRect(x1, borderY, 500, y - borderY, 10).stroke();

  y = y + 20;
  const signatureHeight = 90; // 56 + 34 gap
  if (y + signatureHeight > 780) {
    pdfDoc.addPage();
    y = 40;
  }
  y = drawSignature(pdfDoc, dict, document, y);

  const { start, count } = pdfDoc.bufferedPageRange();
  for (let i = start; i < start + count; i++) {
    pdfDoc.switchToPage(i);

    await drawPageHeader();
    await drawPageFooter(pdfDoc, dict, i + 1, count);
  }
}

async function drawDocumentHeader(
  pdfDoc: typeof PDFDocument,
  dict: Dictionary,
  document: DocumentWithChildren
) {
  if (document.logoId) {
    const key = `logos/logo-${document.logoId}`;
    const command = new GetObjectCommand({ Bucket: SCW_BUCKET, Key: key });
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    const logoBytes = await fetch(url).then((res) => res.arrayBuffer());
    pdfDoc.image(logoBytes, x2, 40, {
      fit: [width_1, 55],
      align: "center",
      valign: "center"
    });
  }

  const hasPeriod = !!document.dateFrom && !!document.dateTo;

  let y = 40;
  const docNumY = y;
  y = y + 15;
  const docPeriodY = y;
  if (hasPeriod) y = y + 15;
  const docDateY = y;
  y = y + 15;
  const dueDateY = y;
  y = y + 15;
  const lateFeeY = y;

  pdfDoc.font("Normal").fontSize(7).fillColor(grey_1);
  pdfDoc.text(dict.documentNumber[document.type], x4, docNumY);
  if (hasPeriod)
    pdfDoc.text(dict.documentPeriod[document.type], x4, docPeriodY);
  pdfDoc.text(dict.documentDate[document.type], x4, docDateY);
  pdfDoc.font("Bold").fontSize(7).fillColor(grey_1);
  pdfDoc.text(dict.labels.dueDate, x4, dueDateY);
  pdfDoc.font("Normal").fontSize(7).fillColor(grey_1);
  pdfDoc.text(dict.labels.lateFeeRate, x4, lateFeeY);

  pdfDoc.font("Bold").fontSize(9).fillColor(black);
  pdfDoc.text(dict.documentType[document.type], x4, 25, {
    width: width_1,
    align: "right"
  });
  pdfDoc.font("Bold").fontSize(8).fillColor(black);
  pdfDoc.text(document.docNum, x4, docNumY, { width: width_1, align: "right" });
  pdfDoc.font("Normal").fontSize(8).fillColor(black);
  if (hasPeriod) {
    pdfDoc.text(
      `${formatDateShortWithYear(document.dateFrom!, document.language)} - ${formatDateShortWithYear(
        document.dateTo!,
        document.language
      )}`,
      x4,
      docPeriodY,
      { width: width_1, align: "right" }
    );
  }
  pdfDoc.text(formatDate(document.docDate, document.language), x4, docDateY, {
    width: width_1,
    align: "right"
  });
  pdfDoc.font("Bold").fontSize(8).fillColor(black);
  pdfDoc.text(formatDate(document.dueDate, document.language), x4, dueDateY, {
    width: width_1,
    align: "right"
  });
  pdfDoc.font("Normal").fontSize(8).fillColor(black);
  pdfDoc.text(`${toFixed(document.lateFeeRate * 100, 2)} %`, x4, lateFeeY, {
    width: width_1,
    align: "right"
  });

  y = drawPartners(
    pdfDoc,
    dict,
    document.supplier,
    document.recipient,
    document.color
  );
  if (document.type === DocumentType.WAYBILL && document.showCarrier) {
    y = y + 30;
    y = drawCarrier(pdfDoc, dict, document, y);
  }

  return y;
}

async function drawPageHeader() {}

async function drawPageFooter(
  pdfDoc: typeof PDFDocument,
  dict: Dictionary,
  pageNo: number,
  pageQty: number
) {
  const logoBytes = await getImageBytes("/general/logo-dark.png");
  pdfDoc.image(logoBytes, x1, 800, { scale: 0.07 });

  pdfDoc.font("Normal").fontSize(7).fillColor(grey_1);
  pdfDoc.text(dict.texts.pageSelected(pageNo, pageQty), x4, 800, {
    width: width_1,
    align: "right"
  });
}

function drawPartnerLine(
  pdfDoc: typeof PDFDocument,
  supplierLabel: string,
  recipientLabel: string,
  supplierValue: string,
  recipientValue: string,
  y: number
) {
  y = y + 4;
  pdfDoc.font("Normal").fontSize(7).fillColor(grey_1);
  if (supplierValue) pdfDoc.text(supplierLabel, x2, y, labelOptions);
  if (recipientValue) pdfDoc.text(recipientLabel, x4, y, labelOptions);
  pdfDoc.font("Normal").fontSize(7).fillColor(black);
  if (supplierValue) pdfDoc.text(supplierValue, valueX2, y, valueOptions);
  if (recipientValue) pdfDoc.text(recipientValue, valueX4, y, valueOptions);
  pdfDoc.font("Normal").fontSize(7);
  const regNumHeight = Math.max(
    pdfDoc.heightOfString(supplierLabel, labelOptions),
    pdfDoc.heightOfString(recipientLabel, labelOptions),
    pdfDoc.heightOfString(supplierValue, valueOptions),
    pdfDoc.heightOfString(recipientValue, valueOptions)
  );
  y = y + regNumHeight;
  return y;
}

function drawPartners(
  pdfDoc: typeof PDFDocument,
  dict: Dictionary,
  supplier: CompanyWithMethods,
  recipient: CompanyWithMethods,
  color: string
) {
  let y = 150;
  pdfDoc.font("Normal").fontSize(9).fillColor(color);
  pdfDoc.text(dict.labels.supplier, x2, y);
  pdfDoc.text(dict.labels.recipient, x4, y);

  y = y + 20;
  drawLine(pdfDoc, x1, y, width_2, 0.5, color);
  drawLine(pdfDoc, x3, y, width_2, 0.5, color);

  y = y + 15;
  pdfDoc.font("Bold").fontSize(9).fillColor(black);
  pdfDoc.text(supplier.name, x2, y, { width: width_1 });
  pdfDoc.text(recipient.name, x4, y, { width: width_1 });
  const nameHeight = Math.max(
    pdfDoc.heightOfString(supplier.name, { width: width_1 }),
    pdfDoc.heightOfString(recipient.name, { width: width_1 }),
    pdfDoc.heightOfString("one-line-height", { width: width_1 })
  );
  y = y + nameHeight;

  if (
    supplier.regNum ||
    recipient.regNum ||
    supplier.vatNum ||
    recipient.vatNum ||
    supplier.address ||
    recipient.address
  ) {
    y = y + 10;

    if (supplier.regNum || recipient.regNum) {
      y = drawPartnerLine(
        pdfDoc,
        supplier.isIndividual ? dict.labels.idNo : dict.labels.regNo,
        recipient.isIndividual ? dict.labels.idNo : dict.labels.regNo,
        supplier.regNum,
        recipient.regNum,
        y
      );
    }
    if (supplier.vatNum || recipient.vatNum) {
      y = drawPartnerLine(
        pdfDoc,
        dict.labels.vatNo,
        dict.labels.vatNo,
        supplier.vatNum,
        recipient.vatNum,
        y
      );
    }
    if (supplier.address || recipient.address) {
      y = drawPartnerLine(
        pdfDoc,
        dict.labels.address,
        dict.labels.address,
        supplier.address,
        recipient.address,
        y
      );
    }
  }

  if (
    supplier.email ||
    recipient.email ||
    supplier.phone ||
    recipient.phone ||
    supplier.url ||
    recipient.url
  ) {
    y = y + 10;

    if (supplier.email || recipient.email) {
      y = drawPartnerLine(
        pdfDoc,
        dict.labels.email,
        dict.labels.email,
        supplier.email,
        recipient.email,
        y
      );
    }
    if (supplier.phone || recipient.phone) {
      y = drawPartnerLine(
        pdfDoc,
        dict.labels.phoneNo,
        dict.labels.phoneNo,
        supplier.phone,
        recipient.phone,
        y
      );
    }
    if (supplier.url || recipient.url) {
      y = drawPartnerLine(
        pdfDoc,
        dict.labels.homepageUrl,
        dict.labels.homepageUrl,
        supplier.url,
        recipient.url,
        y
      );
    }
  }

  if (
    supplier.paymentMethods.length > 0 ||
    recipient.paymentMethods.length > 0
  ) {
    y = y + 10;
    const itemsCount = Math.max(
      supplier.paymentMethods.length,
      recipient.paymentMethods.length
    );
    for (let i = 0; i < itemsCount; i++) {
      const supplierMethod = supplier.paymentMethods.at(i);
      const recipientMethod = recipient.paymentMethods.at(i);

      y = y + 8;

      if (supplierMethod) drawLine(pdfDoc, x1, y, width_2, 0.5, grey_2);
      if (recipientMethod) drawLine(pdfDoc, x3, y, width_2, 0.5, grey_2);

      y = y + 4;

      y = drawPartnerLine(
        pdfDoc,
        supplierMethod ? dict.paymentMethodType[supplierMethod.type] : "",
        recipientMethod ? dict.paymentMethodType[recipientMethod.type] : "",
        supplierMethod?.name || "",
        recipientMethod?.name || "",
        y
      );

      if (supplierMethod?.accNum || recipientMethod?.accNum) {
        y = drawPartnerLine(
          pdfDoc,
          supplierMethod
            ? dict.paymentMethod.accNumOrId[supplierMethod.type]
            : "",
          recipientMethod
            ? dict.paymentMethod.accNumOrId[recipientMethod.type]
            : "",
          supplierMethod?.accNum || "",
          recipientMethod?.accNum || "",
          y
        );
      }

      if (
        (supplierMethod?.type === PaymentMethodType.BANK &&
          supplierMethod?.field_1) ||
        (recipientMethod?.type === PaymentMethodType.BANK &&
          recipientMethod?.field_1)
      ) {
        y = drawPartnerLine(
          pdfDoc,
          supplierMethod?.type === PaymentMethodType.BANK
            ? dict.paymentMethod.field_1[supplierMethod.type]
            : "",
          recipientMethod?.type === PaymentMethodType.BANK
            ? dict.paymentMethod.field_1[recipientMethod.type]
            : "",
          supplierMethod?.field_1 || "",
          recipientMethod?.field_1 || "",
          y
        );
      }

      if (supplierMethod?.note || recipientMethod?.note) {
        y = drawPartnerLine(
          pdfDoc,
          dict.labels.note,
          dict.labels.note,
          supplierMethod?.note || "",
          recipientMethod?.note || "",
          y
        );
      }
    }
  }

  return y;
}

function drawCarrier(
  pdfDoc: typeof PDFDocument,
  dict: Dictionary,
  document: DocumentWithChildren,
  y: number
) {
  pdfDoc.font("Normal").fontSize(9).fillColor(document.color);
  pdfDoc.text(dict.labels.carrier, x4, y);
  y = y + 20;
  drawLine(pdfDoc, x3, y, width_2, 0.5, document.color);
  y = y + 5;
  y = drawPartnerLine(
    pdfDoc,
    "",
    dict.labels.itemName,
    "",
    document.carrierName,
    y
  );
  if (document.carrierRegNum) {
    y = drawPartnerLine(
      pdfDoc,
      "",
      dict.labels.regNo,
      "",
      document.carrierRegNum,
      y
    );
  }
  if (document.driver) {
    y = drawPartnerLine(pdfDoc, "", dict.labels.driver, "", document.driver, y);
  }
  if (document.vehicle) {
    y = drawPartnerLine(
      pdfDoc,
      "",
      dict.labels.vehicleModel,
      "",
      document.vehicle,
      y
    );
  }
  if (document.vehicleNum) {
    y = drawPartnerLine(
      pdfDoc,
      "",
      dict.labels.vehicleNumber,
      "",
      document.vehicleNum,
      y
    );
  }
  if (document.originAddress) {
    y = drawPartnerLine(
      pdfDoc,
      "",
      dict.labels.originAddress,
      "",
      document.originAddress,
      y
    );
  }
  if (document.destinationAddress) {
    y = drawPartnerLine(
      pdfDoc,
      "",
      dict.labels.destinationAddress,
      "",
      document.destinationAddress,
      y
    );
  }

  return y;
}

function drawTable(
  pdfDoc: typeof PDFDocument,
  dict: Dictionary,
  document: DocumentWithChildren,
  y: number,
  i: number
) {
  y = drawTableHeader(pdfDoc, dict, y);

  while (i < document.items.length) {
    const item = document.items[i];

    pdfDoc.font("Normal").fontSize(7);
    const rowHeight =
      16 + Math.max(pdfDoc.heightOfString(item.name, { width: 225 }), 10.5);
    if (y + rowHeight < 790) {
      y = drawTableRow(pdfDoc, item, y, i);
      i++;
    } else break;
  }

  return { itemIndex: i, y };
}

function drawTableHeader(
  pdfDoc: typeof PDFDocument,
  dict: Dictionary,
  y: number
) {
  pdfDoc.font("Normal").fontSize(7).fillColor(grey_1);
  pdfDoc.text("#", 60, y, { width: 25, align: "center" });
  pdfDoc.text(dict.labels.itemName, 85, y, { width: 225, align: "left" });
  pdfDoc.text(dict.labels.unit, 310, y, { width: 40, align: "center" });
  pdfDoc.text(dict.labels.quantity, 350, y, { width: 40, align: "center" });
  pdfDoc.text(dict.labels.price, 390, y, {
    width: 50,
    align: "center"
  });
  pdfDoc.text(dict.labels.vat, 440, y, { width: 40, align: "center" });
  pdfDoc.text(dict.labels.total, 480, y, { width: 60, align: "right" });

  pdfDoc.fontSize(5);
  pdfDoc.text(dict.labels.withoutVatLowercase, 390, y + 8, {
    width: 50,
    align: "center"
  });
  pdfDoc.text(dict.labels.rate, 440, y + 8, {
    width: 40,
    align: "center"
  });
  pdfDoc.text(dict.labels.withoutVatLowercase, 480, y + 8, {
    width: 60,
    align: "right"
  });

  y = y + 20;
  drawLine(pdfDoc, x2, y, width_3, 0.5, grey_2);

  return y;
}

function drawTableRow(
  pdfDoc: typeof PDFDocument,
  item: Item,
  y: number,
  i: number
) {
  pdfDoc.font("Normal").fontSize(7);
  const nameHeight = Math.max(
    pdfDoc.heightOfString(item.name, { width: 225 }),
    10.5
  );
  if (i % 2 === 1) drawLine(pdfDoc, x1, y, 500, 16 + nameHeight, grey_3);

  y = y + 8;

  pdfDoc.font("Normal").fontSize(7).fillColor(grey_1);
  pdfDoc.text(`${i + 1}`, 60, y, { width: 25, align: "center" });
  pdfDoc.text(item.name, 85, y, { width: 225, align: "left" });
  pdfDoc.text(item.unit, 310, y, { width: 40, align: "center" });
  pdfDoc.text(`${item.quantity}`, 350, y, { width: 40, align: "center" });
  pdfDoc.text(toFixed(item.netPrice, 4), 390, y, {
    width: 50,
    align: "center"
  });
  const vatRate =
    item.vatRate === null ? "" : `${toFixed(item.vatRate * 100, 2)} %`;
  pdfDoc.text(vatRate, 440, y, { width: 40, align: "center" });
  pdfDoc.text(toFixed(item.netTotal, 2), 480, y, {
    width: 60,
    align: "right"
  });

  y = y + nameHeight;
  y = y + 8;
  return y;
}

function getTotalBlockHeight(
  pdfDoc: typeof PDFDocument,
  document: DocumentWithChildren
) {
  const dict = getDictionary(document.language);
  const { nonTaxableNetTotal, vats, lateFeeTotal, grossTotal } =
    calculateDocumentTotals(
    document.items,
    document.dueDate,
    document.lateFeeRate,
    document.fromDocuments
  );
  const totalInWords = amountToWords(
    grossTotal,
    document.currency,
    document.language
  );

  let height = 0;
  if (nonTaxableNetTotal > 0) height = height + 14;
  height = height + 14;
  [...vats].forEach(() => (height = height + 14));
  document.fromDocuments.forEach(() => (height = height + 14));
  if (lateFeeTotal > 0) height = height + 14;
  height = height + 18;
  height = height + 10;
  if (totalInWords) {
    const text = `${dict.labels.totalInWords}: ${totalInWords}`;
    pdfDoc.font("Normal").fontSize(7);
    height = height + pdfDoc.heightOfString(text, { width: width_1 });
  }

  if (document.showCurrencyRate) {
    height = height + 4;
    height = height + 10;
  }

  if (document.paymentMethodType) {
    height = height + 4;
    height = height + 14;
    height = height + 10;
  }

  if (document.note) {
    height = height + 15;
    height = height + 14;
    pdfDoc.font("Normal").fontSize(7);
    height = height + pdfDoc.heightOfString(document.note, { width: width_3 });
  }

  return height;
}

function drawTotal(
  pdfDoc: typeof PDFDocument,
  dict: Dictionary,
  document: DocumentWithChildren,
  y: number
) {
  const {
    netTotal,
    nonTaxableNetTotal,
    vats,
    subtotal,
    lateFeeTotal,
    grossTotal
  } = calculateDocumentTotals(
    document.items,
    document.dueDate,
    document.lateFeeRate,
    document.fromDocuments
  );

  pdfDoc.font("Normal").fontSize(7).fillColor(grey_1);
  pdfDoc.text(dict.labels.totalWithoutVat, x4, y);
  pdfDoc.text(
    amountWithCurrency(toFixed(netTotal, 2), document.currency),
    x4,
    y,
    { width: width_1, align: "right" }
  );

  if (nonTaxableNetTotal > 0) {
    y = y + 14;
    pdfDoc.text(
      dict.texts.nonTaxable(nonTaxableNetTotal, document.currency),
      x4,
      y
    );
  }

  [...vats].map(([vatRate, { taxableNetTotal, vatTotal }]) => {
    y = y + 14;
    pdfDoc.text(
      dict.texts.vatFrom(vatRate, taxableNetTotal, document.currency),
      x4,
      y
    );
    pdfDoc.text(
      amountWithCurrency(toFixed(vatTotal, 2), document.currency),
      x4,
      y,
      { width: width_1, align: "right" }
    );
  });

  y = y + 14;
  pdfDoc.text(dict.labels.subtotal, x4, y);
  pdfDoc.text(
    amountWithCurrency(toFixed(subtotal, 2), document.currency),
    x4,
    y,
    { width: width_1, align: "right" }
  );

  document.fromDocuments.map(({ fromDocument, amount }) => {
    y = y + 14;
    pdfDoc.text(dict.texts.prepaymentInvoiceWithId(fromDocument.docNum), x4, y);
    pdfDoc.text(
      amountWithCurrency(toFixed(amount, 2), document.currency),
      x4,
      y,
      { width: width_1, align: "right" }
    );
  });

  if (lateFeeTotal > 0) {
    y = y + 14;
    pdfDoc.text(dict.texts.lateFee(document.language), x4, y);
    pdfDoc.text(
      amountWithCurrency(toFixed(lateFeeTotal, 2), document.currency),
      x4,
      y,
      { width: width_1, align: "right" }
    );
  }

  y = y + 18;
  pdfDoc.font("Bold").fontSize(8).fillColor(black);
  pdfDoc.text(dict.labels.total, x4, y);
  pdfDoc.text(
    amountWithCurrency(toFixed(grossTotal, 2), document.currency),
    x4,
    y,
    { width: width_1, align: "right" }
  );
  y = y + 10;

  const totalInWords = amountToWords(
    grossTotal,
    document.currency,
    document.language
  );
  if (totalInWords) {
    const totalInWordsText = `${dict.labels.totalInWords}: ${totalInWords}`;
    pdfDoc.font("Normal").fontSize(7).fillColor(grey_1);
    pdfDoc.text(totalInWordsText, x4, y, { width: width_1 });
    y = y + pdfDoc.heightOfString(totalInWordsText, { width: width_1 });
  }

  if (document.showCurrencyRate) {
    y = y + 4;
    pdfDoc.font("Normal").fontSize(7).fillColor(grey_1);
    pdfDoc.text(
      `${dict.labels.total} (1 ${document.currency} = ${toFixed(
        document.currencyRate,
        4
      )} ${document.company.currency})`,
      x4,
      y
    );
    pdfDoc.text(
      `${toFixed(grossTotal * document.currencyRate, 2)} ${
        document.company.currency
      }`,
      x4,
      y,
      {
        width: width_1,
        align: "right"
      }
    );
    y = y + 10;
  }

  if (document.paymentMethodType) {
    y = y + 4;
    pdfDoc.font("Normal").fontSize(7).fillColor(grey_1);
    pdfDoc.text(dict.labels.paymentType, x2, y);

    y = y + 14;
    pdfDoc.fillColor(black);
    let value = document.paymentMethodType;
    const zRes = z.enum(PaymentMethodType).safeParse(value);
    if (zRes.success) value = dict.paymentMethodType[zRes.data];
    pdfDoc.text(value, x2, y);
    y = y + 10;
  }

  if (document.note) {
    y = y + 15;
    pdfDoc.font("Normal").fontSize(7).fillColor(grey_1);
    pdfDoc.text(dict.labels.note, x2, y);

    y = y + 14;
    pdfDoc.fillColor(black);
    pdfDoc.text(document.note, x2, y, { width: width_3 });
    y = y + pdfDoc.heightOfString(document.note, { width: width_3 });
  }

  return y;
}

function drawSignature(
  pdfDoc: typeof PDFDocument,
  dict: Dictionary,
  document: DocumentWithChildren,
  y: number
) {
  if (document.signatureType === SignatureType.WITHOUT_SIGNATURE) {
    pdfDoc.font("Normal").fontSize(7).fillColor(grey_1);
    pdfDoc.text(dict.labels.validWithoutSignature, x2, y, {
      width: width_3,
      align: "center"
    });
    return y;
  }

  pdfDoc.font("Bold").fontSize(8).fillColor(black);
  pdfDoc.text(dict.labels.supplier, x2, y);
  document.signatureType === SignatureType.BOTH_SIGNATURES &&
    pdfDoc.text(dict.labels.recipient, x4, y);

  y = y + 18;
  pdfDoc.font("Normal").fontSize(7).fillColor(grey_1);
  pdfDoc.text(`${dict.labels.name}:`, x2, y);
  document.signatureType === SignatureType.BOTH_SIGNATURES &&
    pdfDoc.text(`${dict.labels.name}:`, x4, y);
  pdfDoc.fillColor(black);
  if (document.supplierSignatureName) {
    pdfDoc.text(document.supplierSignatureName, x2, y, {
      width: width_1,
      align: "right"
    });
  } else {
    drawLine(pdfDoc, x2 + 70, y + 10, width_1 - 70, 0.5, black);
  }
  if (document.signatureType === SignatureType.BOTH_SIGNATURES) {
    if (document.recipientSignatureName)
      pdfDoc.text(document.recipientSignatureName, x4, y, {
        width: width_1,
        align: "right"
      });
    else drawLine(pdfDoc, x4 + 70, y + 10, width_1 - 70, 0.5, black);
  }

  y = y + 14;
  pdfDoc.fillColor(grey_1);
  pdfDoc.text(`${dict.labels.date}:`, x2, y);
  document.signatureType === SignatureType.BOTH_SIGNATURES &&
    pdfDoc.text(`${dict.labels.date}:`, x4, y);
  pdfDoc.fillColor(black);
  if (document.supplierSignatureDate) {
    pdfDoc.text(
      formatDate(document.supplierSignatureDate, document.language),
      x2,
      y,
      { width: width_1, align: "right" }
    );
  } else {
    drawLine(pdfDoc, x2 + 70, y + 10, width_1 - 70, 0.5, black);
  }
  if (document.signatureType === SignatureType.BOTH_SIGNATURES) {
    if (document.recipientSignatureDate)
      pdfDoc.text(
        formatDate(document.recipientSignatureDate, document.language),
        x4,
        y,
        { width: width_1, align: "right" }
      );
    else drawLine(pdfDoc, x4 + 70, y + 10, width_1 - 70, 0.5, black);
  }

  y = y + 14;
  pdfDoc.fillColor(grey_1);
  document.supplierSignatureHasLine &&
    pdfDoc.text(`${dict.labels.signature}:`, x2, y);
  document.signatureType === SignatureType.BOTH_SIGNATURES &&
    document.recipientSignatureHasLine &&
    pdfDoc.text(`${dict.labels.signature}:`, x4, y);

  y = y + 10;
  pdfDoc.fillColor(black);
  document.supplierSignatureHasLine &&
    drawLine(pdfDoc, x2 + 70, y, width_1 - 70, 0.5, black);
  document.signatureType === SignatureType.BOTH_SIGNATURES &&
  document.recipientSignatureHasLine &&
    drawLine(pdfDoc, x4 + 70, y, width_1 - 70, 0.5, black);

  if (document.showElectronicSignatureNotice) {
    y = y + 14;
    pdfDoc.fillColor(grey_1);
    pdfDoc.text(dict.labels.electronicSignatureNotice, x2, y, {
      width: width_3,
      align: "center"
    });
    y = y + 10;
  }

  return y;
}
