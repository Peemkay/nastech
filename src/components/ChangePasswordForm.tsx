"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    setSubmitting(true);
    setError(null);
    setDone(false);
    const res = await fetch("/api/account/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Could not change password");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  }

  return (
    <div>
      <div className="mb-4">
        <Label required>Current password</Label>
        <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Password" />
      </div>
      <div className="mb-4">
        <Label required>New password</Label>
        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} placeholder="At least 6 characters" />
      </div>
      {error && (
        <p className="mb-3 flex items-center gap-1.5 text-sm text-danger">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </p>
      )}
      {done && (
        <p className="mb-3 flex items-center gap-1.5 text-sm text-green-700">
          <CheckCircle2 className="size-4 shrink-0" /> Password updated.
        </p>
      )}
      <Button onClick={submit} loading={submitting} disabled={!currentPassword || newPassword.length < 6}>
        Update Password
      </Button>
    </div>
  );
}
