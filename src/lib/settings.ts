import { prisma } from "@/lib/prisma";

/** Settings is a singleton row (id: "singleton"). Creates it with defaults on first access. */
export async function getSettings() {
  return prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", activeGateways: ["PAYSTACK", "FLUTTERWAVE", "BANK_TRANSFER"] },
  });
}

export function parseActiveGateways(json: unknown): string[] {
  if (Array.isArray(json)) return json as string[];
  return ["PAYSTACK", "FLUTTERWAVE", "BANK_TRANSFER"];
}
