"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut, auth } from "@/lib/auth";

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

export async function adminLoginAction(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { identifier, password, redirect: false });
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
