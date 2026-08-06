"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CalendarDays, ChevronLeft, Clock, MapPin, Store, Sun, Sunrise, Sunset, Truck, Wrench } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { DEFAULT_ENABLED_STATE, REPAIR_SERVICE_TYPE_LABELS, type RepairServiceType } from "@/lib/constants";
import { StepIndicator } from "@/components/sell/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Label, Input, Select, Textarea } from "@/components/ui/Field";
import { LocationSelect } from "@/components/LocationSelect";
import { DeviceIcon } from "@/components/DeviceIcon";
import { cn } from "@/lib/utils";

type Issue = { id: string; name: string; type: string; basePriceKobo: number; durationHint: string; description: string };
type Brand = { id: string; name: string };
type Props = {
  category: { id: string; name: string; slug: string; icon: string };
  brands: Brand[];
  issues: Issue[];
};

const SLOTS = [
  { id: "Morning (9am - 12pm)", label: "Morning", time: "9am – 12pm", icon: Sunrise },
  { id: "Afternoon (12pm - 4pm)", label: "Afternoon", time: "12pm – 4pm", icon: Sun },
  { id: "Evening (4pm - 7pm)", label: "Evening", time: "4pm – 7pm", icon: Sunset },
];

const STEPS = ["Device", "Issues", "Service", "Review"];

export function RepairWizard({ category, brands, issues }: Props) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const today = new Date().toISOString().slice(0, 10);

  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");
  const [deviceLabel, setDeviceLabel] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([]);
  const [serviceType, setServiceType] = useState<RepairServiceType>("DROP_OFF");
  const [form, setForm] = useState({
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    pickupLine1: "",
    pickupLine2: "",
    pickupCity: "",
    pickupLga: "",
    pickupState: DEFAULT_ENABLED_STATE,
    pickupDate: "",
    pickupSlot: SLOTS[0].id,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedIssues = useMemo(() => issues.filter((i) => selectedIssueIds.includes(i.id)), [issues, selectedIssueIds]);
  const estimateKobo = selectedIssues.reduce((sum, i) => sum + i.basePriceKobo, 0);

  function toggleIssue(id: string) {
    setSelectedIssueIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function stepValid(i: number) {
    if (i === 0) return deviceLabel.trim().length > 1;
    if (i === 1) return selectedIssueIds.length > 0;
    if (i === 2) {
      const contactOk = /\S+@\S+\.\S+/.test(form.contactEmail) && form.contactPhone.trim().length > 6 && form.contactName.trim().length > 1;
      if (!contactOk) return false;
      if (serviceType === "DROP_OFF") return true;
      return form.pickupLine1.trim().length > 2 && form.pickupCity.trim().length > 1 && form.pickupState && form.pickupDate >= today;
    }
    return true;
  }

  function goNext() {
    setError(null);
    if (!stepValid(stepIndex)) {
      setError("Please complete this step before continuing.");
      return;
    }
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function goBack() {
    setError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/repair-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: category.id,
          brandId: brandId || null,
          deviceLabel,
          problemDescription,
          issueIds: selectedIssueIds,
          serviceType,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      router.push(`/repair/confirm/${data.code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <StepIndicator steps={STEPS} current={stepIndex} />

      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardBody>
              <div className="mb-5 flex items-center gap-3 border-b border-border pb-5">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <DeviceIcon icon={category.icon} className="size-5.5" />
                </span>
                <p className="text-sm font-semibold text-foreground">{category.name} repair</p>
              </div>

              {stepIndex === 0 && (
                <div className="space-y-4">
                  {brands.length > 0 && (
                    <div>
                      <Label>Brand</Label>
                      <Select value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                        <option value="">Other / not listed</option>
                        {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label required>Device</Label>
                    <Input value={deviceLabel} onChange={(e) => setDeviceLabel(e.target.value)} placeholder="e.g. iPhone 12 Pro, 128GB, black" />
                  </div>
                  <div>
                    <Label>Describe the problem</Label>
                    <Textarea value={problemDescription} onChange={(e) => setProblemDescription(e.target.value)} placeholder="e.g. Screen cracked after a drop, still turns on" />
                  </div>
                </div>
              )}

              {stepIndex === 1 && (
                <div>
                  <p className="mb-4 text-sm font-semibold text-foreground">What needs fixing? (select all that apply)</p>
                  {issues.length === 0 ? (
                    <p className="text-sm text-muted">No repair services configured for this category yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {issues.map((issue) => (
                        <button
                          key={issue.id}
                          type="button"
                          onClick={() => toggleIssue(issue.id)}
                          className={cn(
                            "flex w-full items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition",
                            selectedIssueIds.includes(issue.id) ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100" : "border-border hover:border-brand-300",
                          )}
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground">{issue.name}</p>
                            {issue.description && <p className="mt-0.5 text-xs text-muted">{issue.description}</p>}
                            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                              <Clock className="size-3" /> {issue.durationHint} · {issue.type === "SOFTWARE" ? "Software" : "Hardware"}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-bold text-brand-700">from {formatNaira(issue.basePriceKobo, { withDecimals: false })}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {stepIndex === 2 && (
                <div>
                  <p className="mb-3 text-sm font-semibold text-foreground">How should we get your device?</p>
                  <div className="mb-5 grid grid-cols-2 gap-3">
                    {(["DROP_OFF", "PICKUP"] as RepairServiceType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setServiceType(type)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border px-4 py-4 text-center text-sm font-medium transition",
                          serviceType === type ? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-100" : "border-border text-foreground hover:border-brand-300",
                        )}
                      >
                        {type === "DROP_OFF" ? <Store className="size-5" /> : <Truck className="size-5" />}
                        {REPAIR_SERVICE_TYPE_LABELS[type]}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label required>Full name</Label>
                      <Input value={form.contactName} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))} />
                    </div>
                    <div>
                      <Label required>Phone number</Label>
                      <Input value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label required>Email address</Label>
                      <Input type="email" value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} />
                    </div>
                  </div>

                  {serviceType === "PICKUP" && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label required>Pickup address</Label>
                        <Input value={form.pickupLine1} onChange={(e) => setForm((f) => ({ ...f, pickupLine1: e.target.value }))} placeholder="House / street address" />
                      </div>
                      <div className="sm:col-span-2">
                        <Input value={form.pickupLine2} onChange={(e) => setForm((f) => ({ ...f, pickupLine2: e.target.value }))} placeholder="Landmark / apartment (optional)" />
                      </div>
                      <LocationSelect
                        state={form.pickupState}
                        lga={form.pickupLga}
                        onStateChange={(pickupState) => setForm((f) => ({ ...f, pickupState }))}
                        onLgaChange={(pickupLga) => setForm((f) => ({ ...f, pickupLga }))}
                      />
                      <div>
                        <Label required>City / Town</Label>
                        <Input value={form.pickupCity} onChange={(e) => setForm((f) => ({ ...f, pickupCity: e.target.value }))} />
                      </div>
                      <div>
                        <Label required>Pickup date</Label>
                        <Input type="date" min={today} value={form.pickupDate} onChange={(e) => setForm((f) => ({ ...f, pickupDate: e.target.value }))} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label required>Preferred time slot</Label>
                        <div className="grid grid-cols-3 gap-3">
                          {SLOTS.map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setForm((f) => ({ ...f, pickupSlot: slot.id }))}
                              className={cn(
                                "flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-xs font-medium transition",
                                form.pickupSlot === slot.id ? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-100" : "border-border text-foreground hover:border-brand-300",
                              )}
                            >
                              <slot.icon className="size-4.5" />
                              {slot.label}
                              <span className="text-[10px] text-muted">{slot.time}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {stepIndex === 3 && (
                <div className="space-y-5">
                  <div className="rounded-xl bg-silver-100/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Device</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{deviceLabel}</p>
                    {problemDescription && <p className="mt-1 text-sm text-muted">{problemDescription}</p>}
                  </div>
                  <div className="rounded-xl bg-silver-100/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Repairs requested</p>
                    <ul className="mt-2 space-y-1">
                      {selectedIssues.map((i) => (
                        <li key={i.id} className="flex justify-between text-sm">
                          <span className="text-muted">{i.name}</span>
                          <span className="font-medium text-foreground">{formatNaira(i.basePriceKobo, { withDecimals: false })}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-silver-100/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Service</p>
                    <p className="mt-1 text-sm text-foreground">{REPAIR_SERVICE_TYPE_LABELS[serviceType]}</p>
                    {serviceType === "PICKUP" && (
                      <>
                        <p className="mt-1 flex items-start gap-1.5 text-sm text-foreground">
                          <MapPin className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                          {form.pickupLine1}, {form.pickupCity}, {form.pickupState}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
                          <CalendarDays className="size-3.5 shrink-0 text-brand-600" /> {form.pickupDate} · {form.pickupSlot}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <p className="mt-4 flex items-center gap-1.5 text-sm text-danger">
                  <AlertCircle className="size-4 shrink-0" /> {error}
                </p>
              )}

              <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                <Button variant="ghost" onClick={goBack} disabled={stepIndex === 0} icon={<ChevronLeft className="size-4" />}>
                  Back
                </Button>
                {stepIndex === STEPS.length - 1 ? (
                  <Button onClick={handleSubmit} loading={submitting} icon={<Wrench className="size-4" />}>
                    Book Repair
                  </Button>
                ) : (
                  <Button onClick={goNext}>Continue</Button>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="bg-brand-950 !bg-[#071129] text-white">
            <CardBody>
              <p className="text-xs font-medium text-brand-300">Estimated cost</p>
              <p className="mt-1 text-3xl font-extrabold">{formatNaira(estimateKobo, { withDecimals: false })}</p>
              <p className="mt-1 text-xs text-brand-300">{selectedIssues.length} repair{selectedIssues.length !== 1 ? "s" : ""} selected</p>
              <div className="mt-4 h-px bg-white/10" />
              <ul className="mt-4 space-y-2 text-xs text-brand-200">
                <li>✓ Free diagnosis</li>
                <li>✓ Final price confirmed before work starts</li>
                <li>✓ Genuine parts, warrantied repairs</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
