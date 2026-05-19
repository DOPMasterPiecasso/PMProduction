import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/login";
  const isAuthApi = pathname.startsWith("/api/auth");
  const isBranding = pathname === "/api/branding";
  const isInvoicePage = pathname.startsWith("/invoice/");
  const isInvoiceApi = /^\/api\/invoices\/[^/]+$/.test(pathname) && req.method !== "DELETE";
  const isUpload = pathname.startsWith("/uploads/");
  const isPublic = isLoginPage || isAuthApi || isBranding || isInvoicePage || isInvoiceApi || isUpload;

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!token && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
