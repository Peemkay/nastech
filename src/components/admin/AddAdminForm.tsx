"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Plus, UserPlus } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Label, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function AddAdminForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPERADMIN">("ADMIN");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone: phone || undefined, password, role }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Could not create admin");
      return;
    }
    setDone(true);
    setName(""); setEmail(""); setPhone(""); setPassword(""); setRole("ADMIN");
    router.refresh();
    setTimeout(() => setDone(false), 3000);
  }

  if (!open) {
    return (
      <Button variant="secondary" icon={<UserPlus className="size-4" />} onClick={() => setOpen(true)}>
        Add Admin
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardBody>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Register a new admin</p>
          <button onClick={() => setOpen(false)} className="text-xs font-medium text-muted hover:text-foreground">Cancel</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label required>Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label required>Email address</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Phone number</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="080X XXX XXXX (optional)" />
          </div>
          <div>
            <Label required>Temporary password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} placeholder="At least 6 characters" />
          </div>
          <div>
            <Label required>Privilege level</Label>
            <Select value={role} onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPERADMIN")}>
              <option value="ADMIN">Admin — full dashboard access, cannot manage other admins</option>
              <option value="SUPERADMIN">Super Admin — can also manage user roles</option>
            </Select>
          </div>
        </div>
        {error && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-danger">
            <AlertCircle className="size-4 shrink-0" /> {error}
          </p>
        )}
        {done && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-green-700">
            <CheckCircle2 className="size-4 shrink-0" /> Admin account created — share the temporary password securely and have them change it.
          </p>
        )}
        <Button className="mt-4" icon={<Plus className="size-4" />} onClick={submit} loading={submitting} disabled={!name || !email || password.length < 6}>
          Create Admin
        </Button>
      </CardBody>
    </Card>
  );
}
