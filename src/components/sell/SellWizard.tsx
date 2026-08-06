"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CalendarDays, ChevronLeft, MapPin, ShieldCheck, Sun, Sunrise, Sunset } from "lucide-react";
import { computeQuoteKobo } from "@/lib/quote-engine";
import { formatNaira } from "@/lib/utils";
import { DEFAULT_ENABLED_STATE, formatStateName } from "@/lib/constants";
import { StepIndicator } from "./StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Label, Input } from "@/components/ui/Field";
import { DeviceIcon } from "@/components/DeviceIcon";
import { LocationSelect } from "@/components/LocationSelect";
import { InlineAuthGate } from "@/components/InlineAuthGate";
import { cn } from "@/lib/utils";

type Question = { id: string; question: string; options: { id: string; label: string; deductionBps: number }[] };
type Props = {
  category: { id: string; name: string; slug: string; icon: string };
  brand: { id: string; name: string; slug: string };
  model: { id: string; name: string; slug: string; baseValueKobo: number; storageOptions: string[] };
  questions: Question[];
  isAuthenticated: boolean;
};

const SLOTS = [
  { id: "Morning (9am - 12pm)", label: "Morning", time: "9am – 12pm", icon: Sunrise },
  { id: "Afternoon (12pm - 4pm)", label: "Afternoon", time: "12pm – 4pm", icon: Sun },
  { id: "Evening (4pm - 7pm)", label: "Evening", time: "4pm – 7pm", icon: Sunset },
];

export function SellWizard({ category, brand, model, questions, isAuthenticated }: Props) {
  const router = useRouter();
  const hasStorage = model.storageOptions.length > 0;
  const needsVerification = !isAuthenticated;

  const stepKeys = [
    ...(hasStorage ? (["storage"] as const) : []),
    "condition" as const,
    ...(needsVerification ? (["verify"] as const) : []),
    "pickup" as const,
    "review" as const,
  ];
  const stepLabels = [
    ...(hasStorage ? ["Storage"] : []),
    "Condition",
    ...(needsVerification ? ["Verify"] : []),
    "Pickup",
    "Review",
  ];

  const [stepIndex, setStepIndex] = useState(0);
  const stepKey = stepKeys[stepIndex];
  const [verified, setVerified] = useState(isAuthenticated);

  const [storage, setStorage] = useState(model.storageOptions[0] ?? "");
  const [answers, setAnswers] = useState<Record<string, string>>({});
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

  const answeredOptions = useMemo(
    () =>
      questions
        .map((q) => q.options.find((o) => o.id === answers[q.id]))
        .filter((o): o is { id: string; label: string; deductionBps: number } => !!o),
    [questions, answers],
  );
  const liveQuote = useMemo(() => computeQuoteKobo(model.baseValueKobo, answeredOptions), [model.baseValueKobo, answeredOptions]);
  const allAnswered = answeredOptions.length === questions.length;

  const today = new Date().toISOString().slice(0, 10);

  function stepValid(key: string) {
    if (key === "storage") return !!storage;
    if (key === "condition") return allAnswered;
    if (key === "verify") return verified;
    if (key === "pickup") {
      return (
        form.contactName.trim().length > 1 &&
        form.contactPhone.trim().length > 6 &&
        /\S+@\S+\.\S+/.test(form.contactEmail) &&
        form.pickupLine1.trim().length > 2 &&
        form.pickupCity.trim().length > 1 &&
        form.pickupState &&
        form.pickupDate >= today
      );
    }
    return true;
  }

  function goNext() {
    setError(null);
    if (!stepValid(stepKey)) {
      setError("Please complete this step before continuing.");
      return;
    }
    setStepIndex((i) => Math.min(i + 1, stepKeys.length - 1));
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
      const res = await fetch("/api/sell-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: category.id,
          modelId: model.id,
          storage: storage || null,
          answers,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      router.push(`/sell/confirm/${data.code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <StepIndicator steps={stepLabels} current={stepIndex} />

      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardBody>
              <div className="mb-5 flex items-center gap-3 border-b border-border pb-5">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <DeviceIcon icon={category.icon} className="size-5.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {brand.name} {model.name}
                  </p>
                  <p className="text-xs text-muted">{category.name}</p>
                </div>
              </div>

              {stepKey === "storage" && (
                <div>
                  <p className="mb-4 text-sm font-semibold text-foreground">Select your storage capacity</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {model.storageOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setStorage(opt)}
                        className={cn(
                          "rounded-xl border px-4 py-3 text-sm font-semibold transition",
                          storage === opt
                            ? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-100"
                            : "border-border text-foreground hover:border-brand-300",
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {stepKey === "condition" && (
                <div className="space-y-6">
                  {questions.length === 0 && (
                    <p className="text-sm text-muted">This category has no condition questions configured yet.</p>
                  )}
                  {questions.map((q) => (
                    <div key={q.id}>
                      <p className="mb-3 text-sm font-semibold text-foreground">{q.question}</p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {q.options.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                            className={cn(
                              "rounded-xl border px-4 py-3 text-left text-sm font-medium transition",
                              answers[q.id] === opt.id
                                ? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-100"
                                : "border-border text-foreground hover:border-brand-300",
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {stepKey === "verify" && (
                <div>
                  <p className="mb-4 text-sm font-semibold text-foreground">Verify your phone number to continue</p>
                  <InlineAuthGate
                    defaultMode="register"
                    onSuccess={() => {
                      setVerified(true);
                      setStepIndex((i) => Math.min(i + 1, stepKeys.length - 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </div>
              )}

              {stepKey === "pickup" && (
                <div>
                  <p className="mb-4 text-sm font-semibold text-foreground">Contact & pickup details</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label required>Full name</Label>
                      <Input value={form.contactName} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))} placeholder="e.g. Chidinma Okafor" />
                    </div>
                    <div>
                      <Label required>Phone number</Label>
                      <Input value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} placeholder="080X XXX XXXX" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label required>Email address</Label>
                      <Input type="email" value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} placeholder="you@example.com" />
                    </div>
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
                      <Input value={form.pickupCity} onChange={(e) => setForm((f) => ({ ...f, pickupCity: e.target.value }))} placeholder="e.g. Kubwa" />
                    </div>
                    <div>
                      <Label required>Pickup date</Label>
                      <Input type="date" min={today} value={form.pickupDate} onChange={(e) => setForm((f) => ({ ...f, pickupDate: e.target.value }))} />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label required>Preferred time slot</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {SLOTS.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, pickupSlot: slot.id }))}
                          className={cn(
                            "flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-xs font-medium transition",
                            form.pickupSlot === slot.id
                              ? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-100"
                              : "border-border text-foreground hover:border-brand-300",
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

              {stepKey === "review" && (
                <div className="space-y-5">
                  <div className="rounded-xl bg-silver-100/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Device</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {brand.name} {model.name} {storage && `· ${storage}`}
                    </p>
                  </div>
                  <div className="rounded-xl bg-silver-100/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Condition</p>
                    <ul className="mt-2 space-y-1">
                      {questions.map((q) => (
                        <li key={q.id} className="flex justify-between gap-3 text-sm">
                          <span className="text-muted">{q.question}</span>
                          <span className="font-medium text-foreground">{q.options.find((o) => o.id === answers[q.id])?.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-silver-100/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Pickup</p>
                    <p className="mt-1 flex items-start gap-1.5 text-sm text-foreground">
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                      {form.pickupLine1}, {form.pickupLga && `${form.pickupLga}, `}{form.pickupCity}, {formatStateName(form.pickupState)}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
                      <CalendarDays className="size-3.5 shrink-0 text-brand-600" /> {form.pickupDate} · {form.pickupSlot}
                    </p>
                  </div>
                  <p className="flex items-start gap-2 text-xs text-muted">
                    <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                    This is an instant estimate. Final payout is confirmed after a quick physical inspection at pickup — if the
                    device doesn&apos;t match what you told us, we&apos;ll share a revised offer before you accept.
                  </p>
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
                {stepKey === "review" ? (
                  <Button onClick={handleSubmit} loading={submitting}>
                    Confirm & Schedule Pickup
                  </Button>
                ) : stepKey === "verify" ? null : (
                  <Button onClick={goNext}>Continue</Button>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="bg-brand-950 !bg-[#071129] text-white">
            <CardBody>
              <p className="text-xs font-medium text-brand-300">Estimated value</p>
              <p className="mt-1 text-3xl font-extrabold">{formatNaira(liveQuote, { withDecimals: false })}</p>
              <p className="mt-1 text-xs text-brand-300">
                {allAnswered ? "Based on your answers" : "Updates as you answer condition questions"}
              </p>
              <div className="mt-4 h-px bg-white/10" />
              <ul className="mt-4 space-y-2 text-xs text-brand-200">
                <li>✓ Free doorstep pickup</li>
                <li>✓ Paid within 24 hours of inspection</li>
                <li>✓ No obligation to accept</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
