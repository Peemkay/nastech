"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, Textarea, Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { SELL_REQUEST_STATUSES, SELL_REQUEST_STATUS_LABELS } from "@/lib/constants";
import { nairaToKobo } from "@/lib/utils";

export function SellRequestStatusUpdater({ id, currentStatus, quotedKobo, finalKobo }: { id: string; currentStatus: string; quotedKobo: number; finalKobo: number | null }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [offerNaira, setOfferNaira] = useState(String((finalKobo ?? quotedKobo) / 100));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/admin/sell-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note: note || undefined, finalKobo: nairaToKobo(Number(offerNaira) || 0) }),
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
        {SELL_REQUEST_STATUSES.map((s) => (
          <option key={s} value={s}>{SELL_REQUEST_STATUS_LABELS[s]}</option>
        ))}
      </Select>
      <Label>Final offer (₦) — adjust if condition differs from what was reported</Label>
      <Input type="number" min={0} value={offerNaira} onChange={(e) => setOfferNaira(e.target.value)} className="mb-3" />
      <Label>Note (optional, visible to customer)</Label>
      <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Minor screen scratch found — revised offer" />
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      <Button className="mt-3" onClick={submit} loading={submitting}>
        Save status
      </Button>
    </div>
  );
}
