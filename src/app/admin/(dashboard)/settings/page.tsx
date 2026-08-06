import type { Metadata } from "next";
import { getSettings, parseActiveGateways } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { RegionsManager } from "@/components/admin/RegionsManager";
import type { PaymentMethod } from "@/lib/constants";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Settings</h1>
        <p className="text-sm text-muted">Configure payment methods, bank transfer details, delivery pricing and store settings.</p>
      </div>
      <div className="space-y-6">
        <SettingsForm
          initial={{
            siteName: settings.siteName,
            supportPhone: settings.supportPhone,
            supportEmail: settings.supportEmail,
            activeGateways: parseActiveGateways(settings.activeGateways) as PaymentMethod[],
            defaultGateway: settings.defaultGateway as PaymentMethod,
            bankName: settings.bankName,
            bankAccountNumber: settings.bankAccountNumber,
            bankAccountName: settings.bankAccountName,
            freeShippingThresholdNaira: String(settings.freeShippingThresholdKobo / 100),
            depotName: settings.depotName,
            depotAddress: settings.depotAddress,
            depotLat: String(settings.depotLat),
            depotLng: String(settings.depotLng),
            baseFareNaira: String(settings.baseFareKobo / 100),
            perKmFareNaira: String(settings.perKmFareKobo / 100),
            minFareNaira: String(settings.minFareKobo / 100),
            maxDeliveryKm: String(settings.maxDeliveryKm),
          }}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <RegionsManager />
        </div>
      </div>
    </div>
  );
}
