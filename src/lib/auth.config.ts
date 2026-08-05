import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe slice of the auth config — no providers, no Prisma, no bcrypt.
 * Used directly by middleware.ts (which runs on the Edge runtime and has a
 * strict bundle size limit) and spread into the full config in auth.ts
 * (which runs on the Node runtime everywhere else: route handlers, server
 * components, server actions).
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [],
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
