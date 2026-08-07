import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authAdminConfig } from "@/lib/auth-admin.config";
import { normalizePhone } from "@/lib/phone";

// Separate NextAuth instance for the admin console — see auth-admin.config.ts
// for why. Shares the same User table/password hashes as the storefront
// instance (lib/auth.ts); only the session cookie/basePath differ.
export const { handlers: adminHandlers, auth: adminAuth, signIn: adminSignIn, signOut: adminSignOut } = NextAuth({
  ...authAdminConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or phone number", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = (credentials?.identifier as string | undefined)?.trim();
        const password = credentials?.password as string | undefined;
        if (!identifier || !password) return null;

        const phone = normalizePhone(identifier);
        const user = await prisma.user.findFirst({
          where: phone ? { OR: [{ email: identifier.toLowerCase() }, { phone }] } : { email: identifier.toLowerCase() },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
