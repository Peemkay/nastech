"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, Textarea, Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { REPAIR_STATUSES, REPAIR_STATUS_LABELS } from "@/lib/constants";
import { nairaToKobo } from "@/lib/utils";

export function RepairStatusUpdater({
  id,
  currentStatus,
  estimatedKobo,
  finalKobo,
  paymentStatus,
}: {
  id: string;
  currentStatus: string;
  estimatedKobo: number;
  finalKobo: number | null;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [costNaira, setCostNaira] = useState(String((finalKobo ?? estimatedKobo) / 100));
  const [paid, setPaid] = useState(paymentStatus === "PAID");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/admin/repair-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        note: note || undefined,
        finalKobo: nairaToKobo(Number(costNaira) || 0),
        paymentStatus: paid ? "PAID" : "PENDING",
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not update");
      setSubmitting(false);
      return;
    }
    setNote("");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <div>
      <Label>Update status</Label>
      <Select value={status} onChange={(e) => setStatus(e.target.value)} className="mb-3">
        {REPAIR_STATUSES.map((s) => (
          <option key={s} value={s}>{REPAIR_STATUS_LABELS[s]}</option>
        ))}
      </Select>
      <Label>Final cost (₦) — confirm after diagnosis</Label>
      <Input type="number" min={0} value={costNaira} onChange={(e) => setCostNaira(e.target.value)} className="mb-3" />
      <label className="mb-3 flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="size-4 accent-brand-600" />
        Payment received
      </label>
      <Label>Note (optional, visible to customer)</Label>
      <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Screen part ordered, ready by Thursday" />
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      <Button className="mt-3" onClick={submit} loading={submitting}>
        Save status
      </Button>
    </div>
  );
}
