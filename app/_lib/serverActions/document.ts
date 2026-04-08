"use server";

import { prisma } from "@/app/_lib/constants/prisma";
import { logger } from "../constants/logger";
import { CreateDocumentModel, SendDocumentModel } from "../types/document";
import { getResult } from "../functions/general";
import {
  DocumentEventType,
  DocumentType,
  Language,
  Permission
} from "@/app/_prisma/enums";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { DEFAULT_COLOR, SCW_BUCKET, SMTP_USER } from "../constants/general";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/scaleway/s3";
import { sendMail } from "../serverFunctions/mail";
import { generateDocumentPdf } from "../serverFunctions/pdf";
import { generatePeppolXml } from "../functions/peppol";
import { MailOptions, SMTPOptions } from "../types/mail";
import { decryptData } from "../serverFunctions/crypto";
import { getSessionAndUser } from "../serverFunctions/auth";
import { refresh } from "next/cache";
import { LogoAction } from "../types/logo";
import { hasPermission } from "../serverFunctions/permissions";
import { getCompanyFromCookies } from "../serverFunctions/company";
import { getDocumentFilename } from "../functions/document";
import { mapCreatePaymentMethodsToPaymentMethodCreateWithoutCompanyInputs } from "../functions/paymentMethod";
import { colorRegex } from "../validation/general";
import { createDocumentEvent } from "../serverFunctions/documentEvents";

export async function getPrepaymentDocumentsAction(search: string) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (!(await hasPermission(user, company.id, Permission.DOCUMENT_READ)))
      return getResult(false, 403);

    const documents = await prisma.document.findMany({
      where: {
        companyId: company.id,
        type: DocumentType.PREPAYMENT,
        OR: [
          { docNum: { contains: search, mode: "insensitive" } }
          // { regNum: { contains: search, mode: "insensitive" } }
        ]
      },
      take: 20
    });

    return getResult(true, 0, documents);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}

export async function createDocumentAction(model: CreateDocumentModel) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (!(await hasPermission(user, company.id, Permission.DOCUMENT_WRITE)))
      return getResult(false, 403);

    const { docNum, type, status, language, currency } = model;
    const { docDate, dueDate, dateFrom, dateTo } = model;
    let { duePeriod, lateFeeRate } = model;
    const { note, signatureType, paymentMethodType } = model;
    const { showElectronicSignatureNotice } = model;
    const { netTotal, grossTotal, currencyRate, showCurrencyRate } = model;
    const { logoAction, supplier, recipient, items, fromDocuments } = model;
    const {
      supplierSignatureName,
      supplierSignatureDate,
      supplierSignatureHasLine,
      recipientSignatureName,
      recipientSignatureDate,
      recipientSignatureHasLine
    } = model;
    const {
      showCarrier,
      carrierCountry,
      carrierName,
      carrierRegNum,
      driver,
      vehicle,
      vehicleNum,
      originAddress,
      destinationAddress
    } = model;

    const logo = await prisma.logo.findFirst({
      where: { companyId: company.id }
    });

    let { color } = model;
    if (!colorRegex.test(color)) color = DEFAULT_COLOR;

    const document = await prisma.document.create({
      data: {
        type,
        language,
        currency,
        status,
        docNum,
        docDate,
        dateFrom,
        dateTo,
        dueDate,
        duePeriod: duePeriod || 0,
        lateFeeRate: lateFeeRate || 0,
        note,
        signatureType,
        showElectronicSignatureNotice,

        netTotal: netTotal || 0,
        grossTotal: grossTotal || 0,
        currencyRate: currencyRate || 0,
        showCurrencyRate,
        paymentMethodType,
        color,

        supplierSignatureName,
        supplierSignatureDate,
        supplierSignatureHasLine,
        recipientSignatureName,
        recipientSignatureDate,
        recipientSignatureHasLine,

        showCarrier,
        carrierCountry,
        carrierName,
        carrierRegNum,
        driver,
        vehicle,
        vehicleNum,
        originAddress,
        destinationAddress,

        author: { connect: { id: user.id } },
        company: { connect: { id: company.id } },

        logo: {
          connect:
            logoAction === LogoAction.CONNECT && logo
              ? { id: logo.id }
              : undefined,
          create: logoAction === LogoAction.CREATE ? {} : undefined
        },

        supplier: {
          create: {
            isIndividual: supplier.isIndividual,
            country: supplier.country,
            name: supplier.name,
            regNum: supplier.regNum,
            vatNum: supplier.vatNum,
            address: supplier.address,
            email: supplier.email,
            url: supplier.url,
            phone: supplier.phone,
            note: supplier.note,
            comment: "",
            language: Language.EN,
            currency: "",
            duePeriod: 0,
            lateFeeRate: 0,
            vatRate: 0,
            color: "",
            smtpHost: "",
            smtpUser: "",
            smtpPassword: new Uint8Array(),
            smtpPasswordDek: new Uint8Array(),
            paymentMethods: supplier.paymentMethods
              ? {
                  create:
                    mapCreatePaymentMethodsToPaymentMethodCreateWithoutCompanyInputs(
                      supplier.paymentMethods
                    )
                }
              : undefined
          }
        },
        recipient: {
          create: {
            isIndividual: recipient.isIndividual,
            country: recipient.country,
            name: recipient.name,
            regNum: recipient.regNum,
            vatNum: recipient.vatNum,
            address: recipient.address,
            email: recipient.email,
            url: recipient.url,
            phone: recipient.phone,
            note: recipient.note,
            comment: "",
            language: Language.EN,
            currency: "",
            duePeriod: 0,
            lateFeeRate: 0,
            vatRate: 0,
            color: "",
            smtpHost: "",
            smtpUser: "",
            smtpPassword: new Uint8Array(),
            smtpPasswordDek: new Uint8Array(),
            paymentMethods: recipient.paymentMethods
              ? {
                  create:
                    mapCreatePaymentMethodsToPaymentMethodCreateWithoutCompanyInputs(
                      recipient.paymentMethods
                    )
                }
              : undefined
          }
        },
        items: {
          create: items.map((item) => {
            const { sku, name, description, unit, quantity } = item;
            const { basePrice, discountRate, discountValue } = item;
            const { netPrice, vatRate, vatValue, grossPrice } = item;
            const { baseTotal, discountTotal } = item;
            const { netTotal, vatTotal, grossTotal } = item;
            return {
              sku,
              name,
              description,
              unit,
              quantity: quantity || 1,
              currency: "",
              basePrice: basePrice || 0,
              discountRate: discountRate || 0,
              discountValue: discountValue || 0,
              netPrice: netPrice || 0,
              vatRate: isNaN(vatRate ?? NaN) ? null : vatRate,
              vatValue: vatValue || 0,
              grossPrice: grossPrice || 0,
              baseTotal: baseTotal || 0,
              discountTotal: discountTotal || 0,
              netTotal: netTotal || 0,
              vatTotal: vatTotal || 0,
              grossTotal: grossTotal || 0
            };
          })
        },
        fromDocuments: {
          create: fromDocuments.map((document) => {
            const { fromDocument, amount } = document;
            return {
              fromDocumentId: fromDocument.id,
              amount
            };
          })
        }
      }
    });

    await prisma.documentSettings.update({
      where: { companyId_type: { companyId: company.id, type } },
      data: { index: { increment: 1 } }
    });

    let logoUploadUrl = "";
    if (document.logoId) {
      const key = `logos/logo-${document.logoId}`;
      const command = new PutObjectCommand({ Bucket: SCW_BUCKET, Key: key });
      logoUploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    }

    if (recipient.isPartner) {
      const partner = await prisma.company.findFirst({
        where: { regNum: recipient.regNum, partnerId: company.id }
      });
      await prisma.company.upsert({
        where: { id: partner?.id || "" },
        update: {
          isIndividual: recipient.isIndividual,
          country: recipient.country,
          name: recipient.name,
          regNum: recipient.regNum,
          vatNum: recipient.vatNum,
          address: recipient.address,
          email: recipient.email,
          url: recipient.url,
          phone: recipient.phone,
          note: recipient.note,

          language,
          currency,
          duePeriod,
          lateFeeRate,

          paymentMethods: recipient.paymentMethods
            ? {
                deleteMany: {},
                create:
                  mapCreatePaymentMethodsToPaymentMethodCreateWithoutCompanyInputs(
                    recipient.paymentMethods
                  )
              }
            : undefined
        },
        create: {
          isIndividual: recipient.isIndividual,
          country: recipient.country,
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
          vatRate: company.vatRate,
          color: "",

          smtpHost: "",
          smtpUser: "",
          smtpPassword: new Uint8Array(),
          smtpPasswordDek: new Uint8Array(),

          partner: { connect: { id: company.id } },

          paymentMethods: recipient.paymentMethods
            ? {
                create:
                  mapCreatePaymentMethodsToPaymentMethodCreateWithoutCompanyInputs(
                    recipient.paymentMethods
                  )
              }
            : undefined
        }
      });
    }

    if (supplier.isPartner) {
      await prisma.company.update({
        where: { id: company.id },
        data: {
          isIndividual: supplier.isIndividual,
          country: supplier.country,
          name: supplier.name,
          regNum: supplier.regNum,
          vatNum: supplier.vatNum,
          address: supplier.address,
          email: supplier.email,
          url: supplier.url,
          phone: supplier.phone,
          note: supplier.note,

          language,
          currency,
          duePeriod,
          lateFeeRate,

          paymentMethods: supplier.paymentMethods
            ? {
                deleteMany: {},
                create:
                  mapCreatePaymentMethodsToPaymentMethodCreateWithoutCompanyInputs(
                    supplier.paymentMethods
                  )
              }
            : undefined
        }
      });
    }

    await createDocumentEvent({
      documentId: document.id,
      userId: user.id,
      type: DocumentEventType.CREATE
    });

    refresh();
    return getResult(true, 0, { documentId: document.id, logoUploadUrl });
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function updateDocumentAction(
  id: string,
  model: CreateDocumentModel
) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (!(await hasPermission(user, company.id, Permission.DOCUMENT_WRITE)))
      return getResult(false, 403);

    const { docNum, type, status, language, currency } = model;
    const { docDate, dueDate, dateFrom, dateTo } = model;
    let { duePeriod, lateFeeRate } = model;
    const { note, signatureType, paymentMethodType } = model;
    const { showElectronicSignatureNotice } = model;
    const { netTotal, grossTotal, currencyRate, showCurrencyRate } = model;
    const { logoAction, supplier, recipient, items, fromDocuments } = model;
    const {
      supplierSignatureName,
      supplierSignatureDate,
      supplierSignatureHasLine,
      recipientSignatureName,
      recipientSignatureDate,
      recipientSignatureHasLine
    } = model;
    const {
      showCarrier,
      carrierCountry,
      carrierName,
      carrierRegNum,
      driver,
      vehicle,
      vehicleNum,
      originAddress,
      destinationAddress
    } = model;

    const logo = await prisma.logo.findFirst({
      where: { companyId: company.id }
    });

    let { color } = model;
    if (!colorRegex.test(color)) color = DEFAULT_COLOR;

    const document = await prisma.document.update({
      where: { id },
      data: {
        type,
        language,
        currency,
        status,
        docNum,
        docDate,
        dateFrom: dateFrom,
        dateTo: dateTo,
        dueDate,
        duePeriod: duePeriod || 0,
        lateFeeRate: lateFeeRate || 0,
        note,
        signatureType,
        showElectronicSignatureNotice,

        netTotal: netTotal || 0,
        grossTotal: grossTotal || 0,
        currencyRate: currencyRate || 0,
        showCurrencyRate,
        paymentMethodType,
        color,

        supplierSignatureName,
        supplierSignatureDate,
        supplierSignatureHasLine,
        recipientSignatureName,
        recipientSignatureDate,
        recipientSignatureHasLine,

        showCarrier,
        carrierCountry,
        carrierName,
        carrierRegNum,
        driver,
        vehicle,
        vehicleNum,
        originAddress,
        destinationAddress,

        logo: {
          connect:
            logoAction === LogoAction.CONNECT && logo
              ? { id: logo.id }
              : undefined,
          create: logoAction === LogoAction.CREATE ? {} : undefined,
          disconnect: logoAction === LogoAction.DISCONNECT ? true : undefined
        },

        supplier: {
          update: {
            isIndividual: supplier.isIndividual,
            country: supplier.country,
            name: supplier.name,
            regNum: supplier.regNum,
            vatNum: supplier.vatNum,
            address: supplier.address,
            email: supplier.email,
            url: supplier.url,
            phone: supplier.phone,
            note: supplier.note,

            paymentMethods: supplier.paymentMethods
              ? {
                  deleteMany: {},
                  create:
                    mapCreatePaymentMethodsToPaymentMethodCreateWithoutCompanyInputs(
                      supplier.paymentMethods
                    )
                }
              : undefined
          }
        },
        recipient: {
          update: {
            isIndividual: recipient.isIndividual,
            country: recipient.country,
            name: recipient.name,
            regNum: recipient.regNum,
            vatNum: recipient.vatNum,
            address: recipient.address,
            email: recipient.email,
            url: recipient.url,
            phone: recipient.phone,
            note: recipient.note,

            paymentMethods: recipient.paymentMethods
              ? {
                  deleteMany: {},
                  create:
                    mapCreatePaymentMethodsToPaymentMethodCreateWithoutCompanyInputs(
                      recipient.paymentMethods
                    )
                }
              : undefined
          }
        },
        items: {
          deleteMany: {},
          create: items.map((item) => {
            const { sku, name, description, unit, quantity } = item;
            const { basePrice, discountRate, discountValue } = item;
            const { netPrice, vatRate, vatValue, grossPrice } = item;
            const { baseTotal, discountTotal } = item;
            const { netTotal, vatTotal, grossTotal } = item;
            return {
              sku,
              name,
              description,
              unit,
              quantity: quantity || 1,
              currency: "",
              basePrice: basePrice || 0,
              discountRate: discountRate || 0,
              discountValue: discountValue || 0,
              netPrice: netPrice || 0,
              vatRate: isNaN(vatRate || NaN) ? null : vatRate,
              vatValue: vatValue || 0,
              grossPrice: grossPrice || 0,
              baseTotal: baseTotal || 0,
              discountTotal: discountTotal || 0,
              netTotal: netTotal || 0,
              vatTotal: vatTotal || 0,
              grossTotal: grossTotal || 0
            };
          })
        },
        fromDocuments: {
          deleteMany: {},
          create: fromDocuments.map((document) => {
            const { fromDocument, amount } = document;
            return {
              fromDocumentId: fromDocument.id,
              amount
            };
          })
        }
      }
    });

    let logoUploadUrl = "";
    if (document.logoId) {
      const key = `logos/logo-${document.logoId}`;
      const command = new PutObjectCommand({ Bucket: SCW_BUCKET, Key: key });
      logoUploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    }

    if (recipient.isPartner) {
      const partner = await prisma.company.findFirst({
        where: { regNum: recipient.regNum, partnerId: company.id }
      });
      await prisma.company.upsert({
        where: { id: partner?.id || "" },
        update: {
          country: recipient.country,
          name: recipient.name,
          regNum: recipient.regNum,
          vatNum: recipient.vatNum,
          address: recipient.address,
          email: recipient.email,
          url: recipient.url,
          phone: recipient.phone,
          note: recipient.note,

          language,
          currency,
          duePeriod,
          lateFeeRate,

          paymentMethods: recipient.paymentMethods
            ? {
                deleteMany: {},
                create:
                  mapCreatePaymentMethodsToPaymentMethodCreateWithoutCompanyInputs(
                    recipient.paymentMethods
                  )
              }
            : undefined
        },
        create: {
          isIndividual: recipient.isIndividual,
          country: recipient.country,
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
          vatRate: company.vatRate,
          color: "",

          smtpHost: "",
          smtpUser: "",
          smtpPassword: new Uint8Array(),
          smtpPasswordDek: new Uint8Array(),

          partner: { connect: { id: company.id } },

          paymentMethods: recipient.paymentMethods
            ? {
                create:
                  mapCreatePaymentMethodsToPaymentMethodCreateWithoutCompanyInputs(
                    recipient.paymentMethods
                  )
              }
            : undefined
        }
      });
    }

    if (supplier.isPartner) {
      await prisma.company.update({
        where: { id: company.id },
        data: {
          isIndividual: supplier.isIndividual,
          country: supplier.country,
          name: supplier.name,
          regNum: supplier.regNum,
          vatNum: supplier.vatNum,
          address: supplier.address,
          email: supplier.email,
          url: supplier.url,
          phone: supplier.phone,
          note: supplier.note,

          language,
          currency,
          duePeriod,
          lateFeeRate,

          paymentMethods: supplier.paymentMethods
            ? {
                deleteMany: {},
                create:
                  mapCreatePaymentMethodsToPaymentMethodCreateWithoutCompanyInputs(
                    supplier.paymentMethods
                  )
              }
            : undefined
        }
      });
    }

    await createDocumentEvent({
      documentId: document.id,
      userId: user.id,
      type: DocumentEventType.UPDATE
    });

    refresh();
    return getResult(true, 0, { documentId: document.id, logoUploadUrl });
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function convertDocumentAction(id: string, type: DocumentType) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (!(await hasPermission(user, company.id, Permission.DOCUMENT_WRITE)))
      return getResult(false, 403);

    await prisma.document.update({ where: { id }, data: { type } });

    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function deleteDocumentAction(id: string) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (!(await hasPermission(user, company.id, Permission.DOCUMENT_WRITE)))
      return getResult(false, 403);

    await prisma.document.delete({ where: { id } });
    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function sendDocumentAction(id: string, model: SendDocumentModel) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (!(await hasPermission(user, company.id, Permission.DOCUMENT_WRITE)))
      return getResult(false, 403);

    const { to, cc, subject, message } = model;

    const document = await prisma.document.findFirst({
      where: { id },
      include: {
        supplier: { include: { paymentMethods: true } },
        recipient: { include: { paymentMethods: true } },
        items: true,
        fromDocuments: { include: { fromDocument: true } },
        company: true
      }
    });
    if (!document) return getResult(false, 1);

    const pdfRes = await generateDocumentPdf(document);
    if (!pdfRes.ok) return getResult(false, 2);
    const pdfBytes = pdfRes.data;

    const xml = generatePeppolXml(document);
    const xmlBytes = new TextEncoder().encode(xml);

    const emailModel: MailOptions = {
      from: { name: company.name, address: SMTP_USER },
      to,
      cc,
      subject,
      html: message,
      attachments: [
        {
          filename: getDocumentFilename(document, "pdf"),
          content: Buffer.from(pdfBytes)
        },
        {
          filename: getDocumentFilename(document, "xml"),
          content: Buffer.from(xmlBytes)
        }
      ]
    };

    let smtpOptions: SMTPOptions | undefined = undefined;
    if (company.smtpHost && company.smtpUser) {
      const smtpPassword = decryptData(
        Buffer.from(company.smtpPassword),
        Buffer.from(company.smtpPasswordDek)
      );
      smtpOptions = {
        host: company.smtpHost,
        port: 465,
        secure: true,
        auth: { user: company.smtpUser, pass: smtpPassword }
      };
      emailModel.from = { name: company.name, address: company.smtpUser };
    }

    const res = await sendMail(emailModel, smtpOptions);
    if (!res.ok) return getResult(false, 3);

    await createDocumentEvent({
      documentId: document.id,
      userId: user.id,
      type: DocumentEventType.SEND
    });
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}
