import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Creates the first admin account from env vars if (and only if) no admin
 * exists yet. Safe to call repeatedly — no-ops once any ADMIN/SUPERADMIN
 * exists. This replaces shipping a known demo password: nothing works until
 * whoever deploys this sets INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD
 * themselves as private env vars.
 */
export async function ensureBootstrapAdmin() {
  const email = process.env.INITIAL_ADMIN_EMAIL;
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (!email || !password) return;

  const existingAdmin = await prisma.user.findFirst({ where: { role: { in: ["ADMIN", "SUPERADMIN"] } } });
  if (existingAdmin) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { role: "SUPERADMIN" },
    create: {
      name: process.env.INITIAL_ADMIN_NAME || "Admin",
      email: email.toLowerCase(),
      passwordHash,
      role: "SUPERADMIN",
      phoneVerified: true,
    },
  });
}
