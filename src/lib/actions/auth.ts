"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { adminSignIn, adminSignOut, adminAuth } from "@/lib/auth-admin";

export async function loginAction(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/account");

  try {
    await signIn("credentials", { identifier, password, redirectTo: callbackUrl });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=1&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"];

// Admin sign-in uses a fully separate NextAuth instance (lib/auth-admin.ts)
// with its own session cookie — an admin session never satisfies the
// storefront's auth() and vice versa. See auth-admin.config.ts.
export async function adminLoginAction(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await adminSignIn("credentials", { identifier, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) redirect("/admin/login?error=1");
    throw error;
  }

  const session = await adminAuth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role ?? "")) {
    await adminSignOut({ redirect: false });
    redirect("/admin/login?error=2");
  }

  redirect("/admin");
}

export async function adminLogoutAction() {
  await adminSignOut({ redirectTo: "/admin/login" });
}
