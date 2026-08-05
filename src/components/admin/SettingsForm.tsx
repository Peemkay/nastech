"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
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
};

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof SettingsValues>(key: K, v: SettingsValues[K]) {
    setValues((s) => ({ ...s, [key]: v }));
  }

  function toggleGateway(gw: PaymentMethod) {
    set("activeGateways", values.activeGateways.includes(gw) ? values.activeGateways.filter((g) => g !== gw) : [...values.activeGateways, gw]);
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
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save settings");
      setSaving(false);
      return;
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
        <CardHeader><p className="text-sm font-semibold text-foreground">Shipping</p></CardHeader>
        <CardBody>
          <Label>Free shipping threshold (₦)</Label>
          <Input type="number" min={0} value={values.freeShippingThresholdNaira} onChange={(e) => set("freeShippingThresholdNaira", e.target.value)} />
          <p className="mt-1.5 text-xs text-muted">Orders at or above this subtotal get free shipping. Below it, a flat ₦2,500 fee applies.</p>
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
