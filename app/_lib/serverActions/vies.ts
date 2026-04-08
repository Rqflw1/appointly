"use server";

import { getResult } from "../functions/general";
import { VIES_API_ID, VIES_API_KEY, VIES_API_URL } from "../constants/general";
import { logger } from "../constants/logger";
import { getSessionAndUser } from "../serverFunctions/auth";
import { ViesResponseSchema } from "../validation/general";

export async function getViesDataAction(vat: string) {
  try {
    const { user } = await getSessionAndUser();
    if (!user) return getResult(false, 401);

    const cleanVat = vat.replace(/[\s-]/g, "").toUpperCase();

    const agent = `VIESAPIClient/1.3.3 Javascript/NodeJS ${process.version}`;
    const basicAuth = Buffer.from(`${VIES_API_ID}:${VIES_API_KEY}`).toString(
      "base64"
    );
    const url = `${VIES_API_URL}/get/vies/euvat/${cleanVat}`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${basicAuth}`,
        "User-Agent": agent,
        "X-VIESAPI-Client": agent
      }
    });

    const body = await res.json();

    const zRes = ViesResponseSchema.safeParse(body);
    if (!zRes.success) return getResult(false, 1);

    return getResult(true, 0, zRes.data.vies);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}
