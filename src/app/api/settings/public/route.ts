import { NextResponse } from "next/server";
import { getSettings, parseActiveGateways } from "@/lib/settings";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({
    activeGateways: parseActiveGateways(settings.activeGateways),
    defaultGateway: settings.defaultGateway,
    bankName: settings.bankName,
    bankAccountNumber: settings.bankAccountNumber,
    bankAccountName: settings.bankAccountName,
    freeShippingThresholdKobo: settings.freeShippingThresholdKobo,
    supportPhone: settings.supportPhone,
    supportEmail: settings.supportEmail,
  });
}
