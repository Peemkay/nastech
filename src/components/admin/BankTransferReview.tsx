"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function BankTransferReview({ paymentId, proofUrl }: { paymentId: string; proofUrl: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"confirm" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "confirm" | "reject") {
    setBusy(action);
    setError(null);
    const res = await fetch(`/api/admin/payments/${paymentId}/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setBusy(null);
      return;
    }
    router.refresh();
    setBusy(null);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {proofUrl && (
        <a href={proofUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
          <FileText className="size-3.5" /> View proof
        </a>
      )}
      <Button size="sm" variant="secondary" icon={<CheckCircle2 className="size-3.5" />} loading={busy === "confirm"} onClick={() => act("confirm")}>
        Confirm
      </Button>
      <Button size="sm" variant="ghost" className="text-danger hover:bg-red-50" icon={<XCircle className="size-3.5" />} loading={busy === "reject"} onClick={() => act("reject")}>
        Reject
      </Button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
