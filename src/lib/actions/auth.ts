"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn, signOut, auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/account");

  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=1&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    throw error;
  }
}

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
});

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
  });
  const callbackUrl = String(formData.get("callbackUrl") ?? "/account");

  if (!parsed.success) {
    redirect(`/register?error=invalid&callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(`/register?error=exists&callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: { name: parsed.data.name, email, phone: parsed.data.phone ?? null, passwordHash },
  });

  try {
    await signIn("credentials", { email, password: parsed.data.password, redirectTo: callbackUrl });
  } catch (error) {
    if (error instanceof AuthError) redirect("/login");
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"];

export async function adminLoginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) redirect("/admin/login?error=1");
    throw error;
  }

  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role ?? "")) {
    await signOut({ redirect: false });
    redirect("/admin/login?error=2");
  }

  redirect("/admin");
}

export async function adminLogoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
