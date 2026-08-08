"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MapPinned, MessageSquare } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/constants";
import { cn, nairaToKobo } from "@/lib/utils";

export type SettingsValues = {
  siteName: string;
  supportPhone: string;
  supportEmail: string;
  activeGateways: PaymentMethod[];
  defaultGateway: PaymentMethod;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  freeShippingThresholdNaira: string;
  smsEnabled: boolean;
  termiiApiKey: string; // write-only: blank submission leaves the stored key unchanged
  hasTermiiApiKey: boolean;
  termiiSenderId: string;
  depotName: string;
  depotAddress: string;
  depotLat: string;
  depotLng: string;
  baseFareNaira: string;
  perKmFareNaira: string;
  minFareNaira: string;
  maxDeliveryKm: string;
};

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  function set<K extends keyof SettingsValues>(key: K, v: SettingsValues[K]) {
    setValues((s) => ({ ...s, [key]: v }));
  }

  function toggleGateway(gw: PaymentMethod) {
    set("activeGateways", values.activeGateways.includes(gw) ? values.activeGateways.filter((g) => g !== gw) : [...values.activeGateways, gw]);
  }

  async function relocateDepot() {
    setGeocoding(true);
    setGeocodeError(null);
    const res = await fetch("/api/admin/settings/geocode-depot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: values.depotAddress }),
    });
    const data = await res.json();
    if (!res.ok) {
      setGeocodeError(data.error ?? "Could not locate that address");
      setGeocoding(false);
      return;
    }
    set("depotLat", String(data.lat));
    set("depotLng", String(data.lng));
    setGeocoding(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteName: values.siteName,
        supportPhone: values.supportPhone,
        supportEmail: values.supportEmail,
        activeGateways: values.activeGateways,
        defaultGateway: values.defaultGateway,
        bankName: values.bankName,
        bankAccountNumber: values.bankAccountNumber,
        bankAccountName: values.bankAccountName,
        freeShippingThresholdKobo: nairaToKobo(Number(values.freeShippingThresholdNaira) || 0),
        smsEnabled: values.smsEnabled,
        termiiApiKey: values.termiiApiKey.trim(), // blank = leave unchanged, handled server-side
        termiiSenderId: values.termiiSenderId.trim(),
        depotName: values.depotName,
        depotAddress: values.depotAddress,
        depotLat: Number(values.depotLat) || 0,
        depotLng: Number(values.depotLng) || 0,
        baseFareKobo: nairaToKobo(Number(values.baseFareNaira) || 0),
        perKmFareKobo: nairaToKobo(Number(values.perKmFareNaira) || 0),
        minFareKobo: nairaToKobo(Number(values.minFareNaira) || 0),
        maxDeliveryKm: Number(values.maxDeliveryKm) || 1,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save settings");
      setSaving(false);
      return;
    }
    if (values.termiiApiKey.trim()) {
      setValues((s) => ({ ...s, termiiApiKey: "", hasTermiiApiKey: true }));
    }
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><p className="text-sm font-semibold text-foreground">Nigerian payment methods</p></CardHeader>
        <CardBody>
          <p className="mb-3 text-xs text-muted">Toggle which gateways customers can pay with at checkout, and pick the default.</p>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((gw) => (
              <div
                key={gw}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3",
                  values.activeGateways.includes(gw) ? "border-brand-300 bg-brand-50/60" : "border-border",
                )}
              >
                <label className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <input type="checkbox" checked={values.activeGateways.includes(gw)} onChange={() => toggleGateway(gw)} className="size-4 accent-brand-600" />
                  {PAYMENT_METHOD_LABELS[gw]}
                </label>
                <label className="flex items-center gap-1.5 text-xs text-muted">
                  <input
                    type="radio"
                    name="defaultGateway"
                    checked={values.defaultGateway === gw}
                    onChange={() => set("defaultGateway", gw)}
                    className="size-3.5 accent-brand-600"
                  />
                  Default
                </label>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><p className="text-sm font-semibold text-foreground">Bank transfer details</p></CardHeader>
        <CardBody className="space-y-4">
          <div>
            <Label>Bank name</Label>
            <Input value={values.bankName} onChange={(e) => set("bankName", e.target.value)} />
          </div>
          <div>
            <Label>Account number</Label>
            <Input value={values.bankAccountNumber} onChange={(e) => set("bankAccountNumber", e.target.value)} />
          </div>
          <div>
            <Label>Account name</Label>
            <Input value={values.bankAccountName} onChange={(e) => set("bankAccountName", e.target.value)} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><p className="text-sm font-semibold text-foreground">Site & support</p></CardHeader>
        <CardBody className="space-y-4">
          <div>
            <Label>Site name</Label>
            <Input value={values.siteName} onChange={(e) => set("siteName", e.target.value)} />
          </div>
          <div>
            <Label>Support phone</Label>
            <Input value={values.supportPhone} onChange={(e) => set("supportPhone", e.target.value)} />
          </div>
          <div>
            <Label>Support email</Label>
            <Input value={values.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><p className="text-sm font-semibold text-foreground">Free shipping</p></CardHeader>
        <CardBody>
          <Label>Free delivery threshold (₦)</Label>
          <Input type="number" min={0} value={values.freeShippingThresholdNaira} onChange={(e) => set("freeShippingThresholdNaira", e.target.value)} />
          <p className="mt-1.5 text-xs text-muted">Orders at or above this subtotal get free delivery. Below it, the distance-based fare below applies.</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <MessageSquare className="size-4 text-brand-600" />
          <p className="text-sm font-semibold text-foreground">SMS / OTP (Termii)</p>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className={cn("flex items-center justify-between rounded-xl border px-4 py-3", values.smsEnabled ? "border-green-300 bg-green-50/60" : "border-border")}>
            <div>
              <p className="text-sm font-medium text-foreground">Enable SMS sending</p>
              <p className="mt-0.5 text-xs text-muted">
                {values.smsEnabled
                  ? "Registration codes are sent by real SMS via Termii."
                  : "Off — codes are shown on-screen instead of texted. Useful for testing without spending SMS credit; real customers won't receive a text while this is off."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={values.smsEnabled}
              onClick={() => set("smsEnabled", !values.smsEnabled)}
              className={cn("relative h-6 w-11 shrink-0 rounded-full transition", values.smsEnabled ? "bg-brand-600" : "bg-silver-300")}
            >
              <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition", values.smsEnabled ? "left-5.5" : "left-0.5")} />
            </button>
          </div>

          <div>
            <Label>Termii API key</Label>
            <Input
              type="password"
              autoComplete="off"
              value={values.termiiApiKey}
              onChange={(e) => set("termiiApiKey", e.target.value)}
              placeholder={values.hasTermiiApiKey ? "•••••••••••••••••••• (set — leave blank to keep)" : "Not set — paste your Termii API key"}
            />
            <p className="mt-1.5 text-xs text-muted">
              From your Termii dashboard → Settings → API Keys. {values.hasTermiiApiKey ? "A key is currently configured." : "No key configured yet — SMS can't be sent until one is set."}
            </p>
          </div>

          <div>
            <Label>Sender ID</Label>
            <Input value={values.termiiSenderId} onChange={(e) => set("termiiSenderId", e.target.value)} placeholder="N-Alert (default)" />
            <p className="mt-1.5 text-xs text-muted">Optional — leave blank to use the shared default sender ID.</p>
          </div>
        </CardBody>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex items-center gap-2">
          <MapPinned className="size-4 text-brand-600" />
          <p className="text-sm font-semibold text-foreground">Delivery pricing & depot</p>
        </CardHeader>
        <CardBody>
          <p className="mb-4 text-xs text-muted">
            Delivery fee = base fare + (distance from depot × per-km rate), floored at the minimum fare. Distance is calculated by road route via Google Maps.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Depot name</Label>
              <Input value={values.depotName} onChange={(e) => set("depotName", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Depot address</Label>
              <div className="flex gap-2">
                <Input value={values.depotAddress} onChange={(e) => set("depotAddress", e.target.value)} />
                <Button type="button" variant="secondary" size="md" onClick={relocateDepot} loading={geocoding}>
                  Locate
                </Button>
              </div>
              {geocodeError && <p className="mt-1 text-xs text-danger">{geocodeError}</p>}
              <p className="mt-1 text-xs text-muted">Click Locate to auto-fill coordinates from the address (requires Google Maps API key to be configured).</p>
            </div>
            <div>
              <Label>Latitude</Label>
              <Input type="number" step="0.0001" value={values.depotLat} onChange={(e) => set("depotLat", e.target.value)} />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input type="number" step="0.0001" value={values.depotLng} onChange={(e) => set("depotLng", e.target.value)} />
            </div>
            <div>
              <Label>Base fare (₦)</Label>
              <Input type="number" min={0} value={values.baseFareNaira} onChange={(e) => set("baseFareNaira", e.target.value)} />
            </div>
            <div>
              <Label>Per-km rate (₦)</Label>
              <Input type="number" min={0} value={values.perKmFareNaira} onChange={(e) => set("perKmFareNaira", e.target.value)} />
            </div>
            <div>
              <Label>Minimum fare (₦)</Label>
              <Input type="number" min={0} value={values.minFareNaira} onChange={(e) => set("minFareNaira", e.target.value)} />
            </div>
            <div>
              <Label>Max delivery distance (km)</Label>
              <Input type="number" min={1} value={values.maxDeliveryKm} onChange={(e) => set("maxDeliveryKm", e.target.value)} />
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="lg:col-span-2 flex items-center gap-3">
        <Button onClick={save} loading={saving} disabled={values.activeGateways.length === 0}>Save settings</Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
            <CheckCircle2 className="size-4" /> Saved
          </span>
        )}
        {error && <span className="text-sm text-danger">{error}</span>}
      </div>
    </div>
  );
}
