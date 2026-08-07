import { prisma } from "@/lib/prisma";

export type AccountPrefill = {
  name: string;
  phone: string;
  email: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    lga: string;
    state: string;
  } | null;
};

/**
 * Remembered details for a logged-in customer — identity fields always come
 * from their account (name/phone/email), address fields come from the last
 * address they used (if any). Every field stays editable in the wizards that
 * consume this; it only supplies the starting values.
 */
export async function getAccountPrefill(userId: string): Promise<AccountPrefill | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      phone: true,
      email: true,
      addresses: { where: { isDefault: true }, take: 1 },
    },
  });
  if (!user) return null;

  const addr = user.addresses[0];
  return {
    name: user.name,
    phone: user.phone ?? "",
    email: user.email,
    address: addr
      ? { line1: addr.line1, line2: addr.line2 ?? "", city: addr.city, lga: addr.lga ?? "", state: addr.state }
      : null,
  };
}

/**
 * Remembers the address a logged-in customer just used, so their next
 * order/sell-request/repair booking starts pre-filled with it. One "default"
 * address per user for now (no address book UI yet) — each new submission
 * simply overwrites it, which matches "remember what they told us most
 * recently."
 */
export async function saveDefaultAddress(
  userId: string,
  addr: { fullName: string; phone: string; line1: string; line2?: string | null; city: string; lga?: string | null; state: string },
) {
  const existing = await prisma.address.findFirst({ where: { userId, isDefault: true } });
  const data = {
    fullName: addr.fullName,
    phone: addr.phone,
    line1: addr.line1,
    line2: addr.line2 || null,
    city: addr.city,
    lga: addr.lga || null,
    state: addr.state,
  };
  if (existing) {
    await prisma.address.update({ where: { id: existing.id }, data });
  } else {
    await prisma.address.create({ data: { ...data, userId, isDefault: true } });
  }
}
