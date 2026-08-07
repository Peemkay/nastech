"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Check, X } from "lucide-react";
import { Input } from "@/components/ui/Field";

export function AdminResetPasswordButton({ userId, disabled }: { userId: string; disabled?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (disabled) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs font-medium text-muted hover:text-brand-600"
      >
        <KeyRound className="size-3.5" /> Reset password
      </button>
    );
  }

  async function submit() {
    if (value.length < 6) {
      setError("At least 6 characters");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/users/${userId}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: value }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not reset password");
      return;
    }
    setDone(true);
    setValue("");
    router.refresh();
    setTimeout(() => {
      setDone(false);
      setOpen(false);
    }, 1800);
  }

  if (done) {
    return <span className="flex items-center gap-1 text-xs font-medium text-green-700"><Check className="size-3.5" /> Password reset</span>;
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="New password"
        className="h-8 w-32 text-xs"
        autoFocus
      />
      <button type="button" disabled={saving} onClick={submit} className="shrink-0 rounded-full p-1.5 text-brand-600 hover:bg-brand-50 disabled:opacity-40" aria-label="Save password">
        <Check className="size-3.5" />
      </button>
      <button type="button" onClick={() => { setOpen(false); setValue(""); setError(null); }} className="shrink-0 rounded-full p-1.5 text-silver-400 hover:bg-red-50 hover:text-danger" aria-label="Cancel">
        <X className="size-3.5" />
      </button>
      {error && <span className="text-[10px] text-danger">{error}</span>}
    </div>
  );
}
