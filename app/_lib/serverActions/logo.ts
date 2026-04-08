"use server";

import { prisma } from "@/app/_lib/constants/prisma";
import { logger } from "../constants/logger";
import { getResult } from "../functions/general";
import { SCW_BUCKET } from "../constants/general";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/scaleway/s3";
import { getSessionAndUser } from "../serverFunctions/auth";
import { Permission } from "@/app/_prisma/enums";
import { hasPermission } from "../serverFunctions/permissions";
import { getCompanyFromCookies } from "../serverFunctions/company";

export async function getLogoUrlAction(id: string) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const logo = await prisma.logo.findFirst({ where: { id } });
    if (!logo) return getResult(false, 404);
    if (!logo.companyId) return getResult(false, 403);

    const key = `logos/logo-${logo.id}`;
    const command = new GetObjectCommand({ Bucket: SCW_BUCKET, Key: key });
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    return getResult(true, 0, url);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}

export async function createLogoAction() {
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

    const logo = await prisma.logo.create({
      data: { company: { connect: { id: company.id } } }
    });

    const key = `logos/logo-${logo.id}`;
    const command = new PutObjectCommand({ Bucket: SCW_BUCKET, Key: key });
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    return getResult(true, 0, url);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}
