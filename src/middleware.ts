import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

// Edge-safe NextAuth instance — built from the provider-less, Prisma-free
// authConfig only, so this file's Edge Function bundle stays well under
// Vercel's 1 MB middleware size limit. Do NOT import "@/lib/auth" here.
const { auth } = NextAuth(authConfig);

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as { role?: string } | undefined;

  const isAdminArea = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAccountArea = pathname.startsWith("/account");

  if (isAdminArea && (!user || !ADMIN_ROLES.includes(user.role ?? ""))) {
    const url = new URL("/admin/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isAccountArea && !user) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
