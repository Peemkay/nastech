"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/Field";

const ROLES = ["CUSTOMER", "ADMIN", "SUPERADMIN"];

export function UserRoleSelect({ userId, role, canEdit }: { userId: string; role: string; canEdit: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(role);
  const [saving, setSaving] = useState(false);

  if (!canEdit) return <span className="text-sm font-medium text-foreground">{role}</span>;

  return (
    <Select
      value={value}
      disabled={saving}
      className="h-9 w-40 text-xs"
      onChange={async (e) => {
        const next = e.target.value;
        setValue(next);
        setSaving(true);
        await fetch(`/api/admin/users/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: next }) });
        setSaving(false);
        router.refresh();
      }}
    >
      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
    </Select>
  );
}
