import { NextRequest, NextResponse } from "next/server";

const CSRF_COOKIE = "csrfToken";

export function proxy(req: NextRequest) {
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set("x-pathname", req.nextUrl.pathname);

  const res = NextResponse.next({ request: { headers: reqHeaders } });
  const token = req.cookies.get(CSRF_COOKIE)?.value;
  if (!token) {
    res.cookies.set(CSRF_COOKIE, crypto.randomUUID().replace(/-/g, ""), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    });
  }

  return res;
}
