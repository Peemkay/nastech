import { adminAuth } from "@/lib/auth-admin";

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"];

/** Returns the session if the current user is an admin/superadmin, otherwise null. Use in every /api/admin/* route handler — middleware only guards page routes, not the API. */
export async function requireAdmin() {
  const session = await adminAuth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role ?? "")) return null;
  return session;
}
