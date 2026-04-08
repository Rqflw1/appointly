"use server";

import { prisma } from "@/app/_lib/constants/prisma";
import { getResult } from "../functions/general";
import { CreateCompanyModel, UpdateCompanySmtpModel } from "../types/company";
import { logger } from "../constants/logger";
import { encryptData } from "../serverFunctions/crypto";
import { UserAccessLevel } from "@/app/_prisma/browser";
import { getSessionAndUser } from "../serverFunctions/auth";
import { cookies } from "next/headers";
import { CookiesKey } from "../types/general";
import { refresh } from "next/cache";
import {
  DocumentType,
  IndexRefreshRate,
  Permission
} from "@/app/_prisma/enums";
import { hasPermission } from "../serverFunctions/permissions";
import { getCompanyFromCookies } from "../serverFunctions/company";
import { mapCreatePaymentMethodsToPaymentMethodCreateWithoutCompanyInputs } from "../functions/paymentMethod";
import { CreatePartnerModel } from "../validation/partner";
import { DEFAULT_COLOR } from "../constants/general";
import { colorRegex } from "../validation/general";

export async function selectComapnyAction(id?: string) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const companies = await prisma.companyUser.findMany({
      where: { userId: user.id },
      include: { company: true }
    });

    const companyId = id
      ? companies.find((c) => c.companyId === id)?.companyId
      : companies.at(0)?.companyId;

    const cookieStore = await cookies();
    if (companyId) cookieStore.set(CookiesKey.COMPANY_ID, companyId);
    else cookieStore.delete(CookiesKey.COMPANY_ID);

    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function getPartnerAction(id: string) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await prisma.company.findFirst({
      where: { id, partnerId: { not: null } },
      include: { paymentMethods: true, partner: true }
    });

    if (company) {
      if (!company.partnerId) return getResult(false, 403);
      if (
        !(await hasPermission(
          user,
          company.partnerId,
          Permission.DOCUMENT_READ
        ))
      )
        return getResult(false, 403);
    }

    return getResult(true, 0, company);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}

export async function createCompanyAction(model: CreateCompanyModel) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const { isIndividual, country, name, regNum, vatNum, address } = model;
    const { email, url, phone, note, comment } = model;
    const { language, currency, duePeriod, lateFeeRate, vatRate } = model;
    const { isPartner, paymentMethods } = model;

    const company = await getCompanyFromCookies(user);
    if (isPartner && !company) return getResult(false, 403);

    if (
      isPartner &&
      company &&
      !(await hasPermission(user, company.id, Permission.DOCUMENT_WRITE))
    )
      return getResult(false, 403);

    const newCompany = await prisma.company.create({
      data: {
        isIndividual,
        country,
        name,
        regNum,
        vatNum,
        address,
        email,
        url,
        phone,
        note,
        comment,

        language,
        currency,
        duePeriod: isNaN(duePeriod) ? null : duePeriod,
        lateFeeRate: isNaN(lateFeeRate) ? null : lateFeeRate,
        vatRate: isNaN(vatRate) ? null : vatRate,
        color: DEFAULT_COLOR,

        smtpHost: "",
        smtpUser: "",
        smtpPassword: new Uint8Array(),
        smtpPasswordDek: new Uint8Array(),

        partner:
          isPartner && company ? { connect: { id: company.id } } : undefined,

        paymentMethods: paymentMethods
          ? {
              create:
                mapCreatePaymentMethodsToPaymentMethodCreateWithoutCompanyInputs(
                  paymentMethods
                )
            }
          : undefined,

        users: !isPartner
          ? {
              create: {
                userId: user.id,
                role: UserAccessLevel.OWNER
              }
            }
          : undefined
      }
    });

    const documentTypes: DocumentType[] = [
      DocumentType.INVOICE,
      DocumentType.WAYBILL,
      DocumentType.PREPAYMENT,
      DocumentType.DEBIT_NOTE
    ];

    await prisma.documentSettings.createMany({
      data: documentTypes.map((type) => ({
        type,
        companyId: newCompany.id,
        docNum: "DOC-{N1}",
        index: 1,
        indexRefreshRate: IndexRefreshRate.NEVER,
        note: "",
        lastRefresh: new Date()
      }))
    });
    await prisma.emailSettings.createMany({
      data: documentTypes.map((type) => ({
        companyId: newCompany.id,
        type,
        cc: "",
        subject: "",
        message: ""
      }))
    });

    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function createPartnersAction(models: CreatePartnerModel[]) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (!(await hasPermission(user, company.id, Permission.DOCUMENT_WRITE)))
      return getResult(false, 403);

    const res = await prisma.$transaction(async (tx) => {
      for (const model of models) {
        const { isIndividual, country, name, regNum, vatNum, address } = model;
        const { email, url, phone, note, comment } = model;
        const { language, currency, duePeriod, lateFeeRate, vatRate } = model;
        const { paymentMethods } = model;

        await tx.company.create({
          data: {
            isIndividual,
            country,
            name,
            regNum,
            vatNum,
            address,
            email,
            url,
            phone,
            note,
            comment,

            language,
            currency,
            duePeriod: isNaN(duePeriod ?? NaN) ? null : duePeriod,
            lateFeeRate: isNaN(lateFeeRate ?? NaN) ? null : lateFeeRate,
            vatRate: isNaN(vatRate ?? NaN) ? null : vatRate,
            color: "",

            smtpHost: "",
            smtpUser: "",
            smtpPassword: new Uint8Array(),
            smtpPasswordDek: new Uint8Array(),

            partner: { connect: { id: company.id } },

            paymentMethods: paymentMethods
              ? {
                  create:
                    mapCreatePaymentMethodsToPaymentMethodCreateWithoutCompanyInputs(
                      paymentMethods
                    )
                }
              : undefined
          }
        });
      }
    });

    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function updateCompanyAction(
  id: string,
  model: CreateCompanyModel
) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const companyToUpdate = await prisma.company.findFirst({ where: { id } });
    if (!companyToUpdate) return getResult(false, 404);

    if (companyToUpdate.partnerId) {
      if (
        !(await hasPermission(
          user,
          companyToUpdate.partnerId,
          Permission.DOCUMENT_WRITE
        ))
      )
        return getResult(false, 403);
    } else {
      if (
        !(await hasPermission(
          user,
          companyToUpdate.id,
          Permission.COMPANY_SETTINGS_WRITE
        ))
      )
        return getResult(false, 403);
    }

    const { isIndividual, country, name, regNum, vatNum, address } = model;
    const { email, url, phone, note, comment } = model;
    const { language, currency, duePeriod, lateFeeRate, vatRate } = model;
    const { paymentMethods } = model;

    await prisma.company.update({
      where: { id },
      data: {
        isIndividual,
        country,
        name,
        regNum,
        vatNum,
        address,
        email,
        url,
        phone,
        note,
        comment,

        language,
        currency,
        duePeriod: isNaN(duePeriod) ? null : duePeriod,
        lateFeeRate: isNaN(lateFeeRate) ? null : lateFeeRate,
        vatRate: isNaN(vatRate) ? null : vatRate,

        paymentMethods: paymentMethods
          ? {
              deleteMany: {},
              create:
                mapCreatePaymentMethodsToPaymentMethodCreateWithoutCompanyInputs(
                  paymentMethods
                )
            }
          : undefined
      }
    });

    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function updateCompanySmtpAction(model: UpdateCompanySmtpModel) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (
      !(await hasPermission(
        user,
        company.id,
        Permission.COMPANY_SETTINGS_WRITE
      ))
    )
      return getResult(false, 403);

    const { smtpHost, smtpUser, smtpPassword } = model;

    const { dataEncrypted, dekEncrypted } = encryptData(smtpPassword);

    await prisma.company.update({
      where: { id: company.id },
      data: {
        smtpHost,
        smtpUser,
        smtpPasswordDek: dekEncrypted,
        smtpPassword: dataEncrypted
      }
    });

    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function updateCompanyColorAction(color: string) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (
      !(await hasPermission(
        user,
        company.id,
        Permission.COMPANY_SETTINGS_WRITE
      ))
    )
      return getResult(false, 403);

    if (!colorRegex.test(color)) color = DEFAULT_COLOR;

    await prisma.company.update({
      where: { id: company.id },
      data: { color }
    });

    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function detachCompanyLogoAction() {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (
      !(await hasPermission(
        user,
        company.id,
        Permission.COMPANY_SETTINGS_WRITE
      ))
    )
      return getResult(false, 403);

    await prisma.company.update({
      where: { id: company.id },
      data: { logo: { disconnect: true } }
    });

    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}

export async function deleteCompanyAction(id: string) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const companyToDelete = await prisma.company.findFirst({ where: { id } });
    if (!companyToDelete) return getResult(false, 404);

    if (companyToDelete.partnerId) {
      if (
        !(await hasPermission(
          user,
          companyToDelete.partnerId,
          Permission.DOCUMENT_WRITE
        ))
      )
        return getResult(false, 403);
    } else {
      if (
        !(await hasPermission(
          user,
          companyToDelete.id,
          Permission.COMPANY_DELETE
        ))
      )
        return getResult(false, 403);
    }

    await prisma.company.delete({ where: { id } });
    refresh();
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    refresh();
    return getResult(false, 500);
  }
}

export async function getPartnersAction(search: string) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const company = await getCompanyFromCookies(user);
    if (!company) return getResult(false, 403);

    if (!(await hasPermission(user, company.id, Permission.DOCUMENT_READ)))
      return getResult(false, 403);

    const companies = await prisma.company.findMany({
      where: {
        partnerId: company.id,
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { regNum: { contains: search, mode: "insensitive" } }
        ]
      },
      include: { paymentMethods: true }
    });

    return getResult(true, 0, companies);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}
