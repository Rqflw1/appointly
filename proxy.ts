import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set("x-pathname", req.nextUrl.pathname);

  const res = NextResponse.next({ request: { headers: reqHeaders } });

  return res;
}
