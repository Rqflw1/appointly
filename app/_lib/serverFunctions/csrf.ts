import "server-only";

import { cookies } from "next/headers";
const CSRF_COOKIE = "csrfToken";

export async function getCsrfToken() {
  const store = await cookies();
  const token = store.get(CSRF_COOKIE)?.value;
  return token ?? "";
}

export async function verifyCsrfToken(formData: FormData) {
  const token = formData.get("csrfToken");
  const store = await cookies();
  const cookie = store.get(CSRF_COOKIE)?.value;
  if (!token || !cookie || token !== cookie) {
    throw new Error("Invalid CSRF token");
  }
}
