import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

// Reading sessions via getToken (not the full NextAuth() auth() wrapper) —
// this is the edge-compatible, provider-free way to check a JWT session in
// middleware, and it lets us check two independent cookies (storefront vs
// admin — see auth-admin.config.ts for why they're separate) in one file
// without pulling in Prisma/bcrypt (keeps this bundle well under Vercel's
// 1 MB Edge Function limit).
const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"];
const secureCookie = process.env.NODE_ENV === "production";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminArea = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAccountArea = pathname.startsWith("/account");

  if (isAdminArea) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET, cookieName: "nastech-admin-session", secureCookie });
    const role = (token?.role as string | undefined) ?? "";
    if (!token || !ADMIN_ROLES.includes(role)) {
      const url = new URL("/admin/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isAccountArea) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET, secureCookie });
    if (!token) {
      const url = new URL("/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
