import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe slice of the ADMIN auth config. Deliberately a fully separate
 * NextAuth instance from the storefront (lib/auth.config.ts) — different
 * cookie name and basePath — so an admin session never satisfies a customer
 * `auth()` check (and vice versa). Logging into the admin console does not
 * log you into the storefront, and logging into the storefront never grants
 * admin access, regardless of role.
 */
export const authAdminConfig = {
  basePath: "/api/admin-auth",
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  trustHost: true,
  providers: [],
  cookies: {
    sessionToken: {
      name: "nastech-admin-session",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
