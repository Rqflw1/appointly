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
import { NEXT_PUBLIC_BASE_URL } from "../constants/general";
import { CompanyWithMethods } from "../types/company";
import z from "zod";
import { amountToWords, amountWithCurrency } from "../functions/document";

// PDF width = 595.28
// PDF height = 841.89

const black = "#000000";
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

export async function generateDocumentPdfHarbstone(
  document: DocumentWithChildren
) {
  try {
    const { pdfDoc, writableStream, chunks } = createDocument();

    const isRu = document.language === "RU";
    const normalFont = isRu ? "DejaVuSans.ttf" : "PlusJakarta.ttf";
    const mediumFont = isRu ? "DejaVuSans.ttf" : "PlusJakarta-Medium.ttf";
    const boldFont = isRu ? "DejaVuSans-Bold.ttf" : "PlusJakarta-SemiBold.ttf";
    const displayFont = isRu ? "DejaVuSerif.ttf" : "DMSerifDisplay.ttf";

    await registerFont(pdfDoc, normalFont, "Normal");
    await registerFont(pdfDoc, mediumFont, "Medium");
    await registerFont(pdfDoc, boldFont, "Bold");
    await registerFont(pdfDoc, displayFont, "DMSerifDisplay");

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

function createDocument(isLandscape = false) {
  const chunks: Uint8Array[] = [];
  const writableStream = new Writable({
    write(chunk, _, callback) {
      chunks.push(chunk);
      callback();
    }
  });
  const pdfDoc = new PDFDocument({
    size: "A4",
    layout: isLandscape ? "landscape" : "portrait",
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
  const logoBytes = await getImageBytes("/general/harbstone-logo.png");
  pdfDoc.image(logoBytes, x2, 45, { scale: 0.12 });

  const hasPeriod = !!document.dateFrom && !!document.dateTo;
  const baseY = 45;
  const rowStep = 14;
  let rowIndex = 0;

  const docNumY = baseY + rowIndex * rowStep;
  rowIndex += 1;
  const periodY = hasPeriod ? baseY + rowIndex * rowStep : null;
  if (hasPeriod) rowIndex += 1;
  const docDateY = baseY + rowIndex * rowStep;
  rowIndex += 1;
  const dueDateY = baseY + rowIndex * rowStep;
  rowIndex += 1;
  const lateFeeY = baseY + rowIndex * rowStep;

  pdfDoc.font("Normal").fontSize(8).fillColor(grey_1);
  pdfDoc.text(dict.documentNumber[document.type], x4, docNumY);
  if (hasPeriod && periodY !== null)
    pdfDoc.text(dict.documentPeriod[document.type], x4, periodY);
  pdfDoc.text(dict.documentDate[document.type], x4, docDateY);
  pdfDoc.text(dict.labels.dueDate, x4, dueDateY);
  pdfDoc.text(dict.labels.lateFeeRate, x4, lateFeeY);

  pdfDoc.font("Bold").fontSize(10).fillColor(black);
  pdfDoc.text(document.docNum, x4, docNumY - 2, {
    width: width_1,
    align: "right"
  });
  pdfDoc.font("Normal").fontSize(8).fillColor(black);
  if (hasPeriod && periodY !== null) {
    pdfDoc.text(
      `${formatDateShortWithYear(document.dateFrom!, document.language)} - ${formatDateShortWithYear(
        document.dateTo!,
        document.language
      )}`,
      x4,
      periodY,
      { width: width_1, align: "right" }
    );
  }
  pdfDoc.text(formatDate(document.docDate, document.language), x4, docDateY, {
    width: width_1,
    align: "right"
  });
  pdfDoc.text(formatDate(document.dueDate, document.language), x4, dueDateY, {
    width: width_1,
    align: "right"
  });
  pdfDoc.text(`${toFixed(document.lateFeeRate * 100, 2)} %`, x4, lateFeeY, {
    width: width_1,
    align: "right"
  });

  const supplierY = drawPartner(
    pdfDoc,
    dict,
    document.supplier,
    false,
    document.color
  );
  const recipientY = drawPartner(
    pdfDoc,
    dict,
    document.recipient,
    true,
    document.color
  );

  let carrierY = 0;
  if (document.type === DocumentType.WAYBILL && document.showCarrier)
    carrierY = drawCarrier(pdfDoc, dict, document, recipientY);

  return Math.max(supplierY, recipientY, carrierY);
}

async function drawPageHeader() {}

async function drawPageFooter(
  pdfDoc: typeof PDFDocument,
  dict: Dictionary,
  pageNo: number,
  pageQty: number
) {
  const logoBytes = await getImageBytes("/general/harbstone-logo.png");
  pdfDoc.image(logoBytes, x2, 800, { scale: 0.08 });

  pdfDoc.font("Normal").fontSize(7).fillColor(grey_1);
  pdfDoc.text(dict.texts.pageSelected(pageNo, pageQty), x4, 800, {
    width: width_1,
    align: "right"
  });
}

function drawPartner(
  pdfDoc: typeof PDFDocument,
  dict: Dictionary,
  partner: CompanyWithMethods,
  isRecipient: boolean,
  accentColor: string
) {
  const x_1 = isRecipient ? x3 : x1;
  const x_2 = isRecipient ? x4 : x2;

  let y = 140;

  pdfDoc.font("Normal").fontSize(7);
  const addressHeight =
    pdfDoc.heightOfString(partner.address, {
      width: width_1 - 40,
      align: "right"
    }) - 10.5;

  pdfDoc.font("Medium").fontSize(9).fillColor(accentColor);
  if (isRecipient) pdfDoc.text(dict.labels.recipient, x_2, y);
  else pdfDoc.text(dict.labels.supplier, x_2, y);
  y = y + 22;
  drawLine(pdfDoc, x_1, y, width_2, 0.75, accentColor);
  y = y + 16;
  pdfDoc.font("DMSerifDisplay").fontSize(13).fillColor(black);
  pdfDoc.text(partner.name, x_2, y, { width: width_1 });
  const nameHeight = Math.max(
    pdfDoc.heightOfString(partner.name, { width: width_1 }),
    18
  );

  y = y + nameHeight;
  const startY = y;
  pdfDoc.font("Normal").fontSize(7).fillColor(grey_1);
  if (partner.regNum) {
    y = y + 14;
    pdfDoc.text(
      partner.isIndividual ? dict.labels.idNo : dict.labels.regNo,
      x_2,
      y
    );
  }
  if (partner.vatNum) {
    y = y + 14;
    pdfDoc.text(dict.labels.vatNo, x_2, y);
  }
  if (partner.address) {
    y = y + 14;
    pdfDoc.text(dict.labels.address, x_2, y);
    y = y + addressHeight;
  }

  if (partner.regNum || partner.vatNum || partner.address) {
    y = y + 8;
  }

  if (partner.email) {
    y = y + 14;
    pdfDoc.text(dict.labels.email, x_2, y);
  }
  if (partner.phone) {
    y = y + 14;
    pdfDoc.text(dict.labels.phoneNo, x_2, y);
  }
  if (partner.url) {
    y = y + 14;
    pdfDoc.text(dict.labels.homepageUrl, x_2, y);
  }

  partner.paymentMethods.forEach((method) => {
    y = y + 8 + 14;
    pdfDoc.text(dict.paymentMethodType[method.type], x_2, y);
    y = y + 14;
    pdfDoc.text(dict.labels.accNumOrId, x_2, y);
    if (method.note) {
      y = y + 14;
      pdfDoc.text(dict.labels.note, x_2, y);
    }
  });

  pdfDoc.font("Bold").fontSize(7).fillColor(black);
  y = startY;
  if (partner.regNum) {
    y = y + 14;
    pdfDoc.text(partner.regNum, x_2, y, { width: width_1, align: "right" });
  }
  if (partner.vatNum) {
    y = y + 14;
    pdfDoc.text(partner.vatNum, x_2, y, { width: width_1, align: "right" });
  }
  if (partner.address) {
    y = y + 14;
    pdfDoc.text(partner.address, x_2 + 40, y, {
      width: width_1 - 40,
      align: "right"
    });
    y = y + addressHeight;
  }

  if (partner.regNum || partner.vatNum || partner.address) {
    y = y + 8;
  }

  if (partner.email) {
    y = y + 14;
    pdfDoc.text(partner.email, x_2, y, { width: width_1, align: "right" });
  }
  if (partner.phone) {
    y = y + 14;
    pdfDoc.text(partner.phone, x_2, y, { width: width_1, align: "right" });
  }
  if (partner.url) {
    y = y + 14;
    pdfDoc.text(partner.url, x_2, y, { width: width_1, align: "right" });
  }

  partner.paymentMethods.forEach((method) => {
    y = y + 8 + 14;
    pdfDoc.text(method.name, x_2, y, {
      width: width_1,
      align: "right"
    });
    y = y + 14;
    pdfDoc.text(method.accNum, x_2, y, {
      width: width_1,
      align: "right"
    });
    if (method.note) {
      y = y + 14;
      pdfDoc.text(method.note, x_2, y, { width: width_1, align: "right" });
    }
  });

  return y;
}

function drawCarrier(
  pdfDoc: typeof PDFDocument,
  dict: Dictionary,
  document: DocumentWithChildren,
  y: number
) {
  const x_1 = x3;
  const x_2 = x4;

  pdfDoc.font("Normal").fontSize(7);
  const carrierNameHeight = Math.max(
    pdfDoc.heightOfString(document.carrierName, {
      width: width_1 - 50,
      align: "right"
    }) - 10.5,
    10.5
  );
  const originAddressHeight =
    pdfDoc.heightOfString(document.originAddress, {
      width: width_1 - 60,
      align: "right"
    }) - 10.5;
  const destinationAddressHeight =
    pdfDoc.heightOfString(document.destinationAddress, {
      width: width_1 - 60,
      align: "right"
    }) - 10.5;

  y = y + 30;
  pdfDoc.font("Medium").fontSize(9).fillColor(black);
  pdfDoc.text(dict.labels.carrier, x_2, y);
  y = y + 22;
  drawLine(pdfDoc, x_1, y, width_2, 0.75, grey_2);

  pdfDoc.font("Normal").fontSize(7).fillColor(grey_1);
  y = y + 8;
  const startY = y;
  pdfDoc.text(dict.labels.itemName, x_2, y);
  y = y + carrierNameHeight;
  if (document.carrierRegNum) {
    y = y + 14;
    pdfDoc.text(dict.labels.regNo, x_2, y);
  }
  if (document.driver) {
    y = y + 14;
    pdfDoc.text(dict.labels.driver, x_2, y);
  }
  if (document.vehicle) {
    y = y + 14;
    pdfDoc.text(dict.labels.vehicleModel, x_2, y);
  }
  if (document.vehicleNum) {
    y = y + 14;
    pdfDoc.text(dict.labels.vehicleNumber, x_2, y);
  }
  if (document.originAddress) {
    y = y + 14;
    pdfDoc.text(dict.labels.originAddress, x_2, y);
    y = y + originAddressHeight;
  }
  if (document.destinationAddress) {
    y = y + 14;
    pdfDoc.text(dict.labels.destinationAddress, x_2, y);
    y = y + destinationAddressHeight;
  }

  y = startY;
  pdfDoc.font("Normal").fontSize(7).fillColor(black);
  pdfDoc.text(document.carrierName, x_2 + 50, y, {
    width: width_1 - 50,
    align: "right"
  });
  y = y + carrierNameHeight;
  if (document.carrierRegNum) {
    y = y + 14;
    pdfDoc.text(document.carrierRegNum, x_2, y, {
      width: width_1,
      align: "right"
    });
  }
  if (document.driver) {
    y = y + 14;
    pdfDoc.text(document.driver, x_2, y, { width: width_1, align: "right" });
  }
  if (document.vehicle) {
    y = y + 14;
    pdfDoc.text(document.vehicle, x_2, y, { width: width_1, align: "right" });
  }
  if (document.vehicleNum) {
    y = y + 14;
    pdfDoc.text(document.vehicleNum, x_2, y, {
      width: width_1,
      align: "right"
    });
  }
  if (document.originAddress) {
    y = y + 14;
    pdfDoc.text(document.originAddress, x_2 + 60, y, {
      width: width_1 - 60,
      align: "right"
    });
    y = y + originAddressHeight;
  }
  if (document.destinationAddress) {
    y = y + 14;
    pdfDoc.text(document.destinationAddress, x_2 + 60, y, {
      width: width_1 - 60,
      align: "right"
    });
    y = y + destinationAddressHeight;
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
  pdfDoc.text("#", 60, y, { width: 25, align: "left" });
  pdfDoc.text(dict.labels.itemName, 85, y, { width: 215, align: "left" });
  pdfDoc.text(dict.labels.unit, 300, y, { width: 40, align: "center" });
  pdfDoc.text(dict.labels.quantity, 340, y, { width: 40, align: "center" });
  pdfDoc.text(dict.labels.price, 380, y, {
    width: 60,
    align: "center"
  });
  pdfDoc.text(dict.labels.vat, 440, y, { width: 40, align: "center" });
  pdfDoc.text(dict.labels.total, 480, y, { width: 60, align: "right" });

  pdfDoc.fontSize(5);
  pdfDoc.text(dict.labels.withoutVatLowercase, 380, y + 8, {
    width: 60,
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
  pdfDoc.text(`${i + 1}`, 60, y, { width: 25, align: "left" });
  pdfDoc.fillColor(black);
  pdfDoc.text(item.name, 85, y, { width: 215, align: "left" });
  pdfDoc.fillColor(grey_1);
  pdfDoc.text(item.unit, 300, y, { width: 40, align: "center" });
  pdfDoc.text(`${item.quantity}`, 340, y, { width: 40, align: "center" });
  pdfDoc.text(toFixed(item.netPrice, 4), 380, y, {
    width: 60,
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
