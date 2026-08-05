"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, Textarea, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function StatusUpdater({
  endpoint,
  statuses,
  labels,
  currentStatus,
  extraFields,
}: {
  endpoint: string;
  statuses: readonly string[];
  labels: Record<string, string>;
  currentStatus: string;
  /** Optional extra body fields to send alongside { status, note }, e.g. { finalKobo } for sell requests. */
  extraFields?: Record<string, unknown>;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note: note || undefined, ...extraFields }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not update status");
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
        {statuses.map((s) => (
          <option key={s} value={s}>{labels[s] ?? s}</option>
        ))}
      </Select>
      <Label>Note (optional, visible to customer on tracking page)</Label>
      <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Shipped via GIG Logistics, tracking XXX" />
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      <Button className="mt-3" onClick={submit} loading={submitting}>
        Save status
      </Button>
    </div>
  );
}
