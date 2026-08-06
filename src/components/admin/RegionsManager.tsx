"use client";

import { useEffect, useState } from "react";
import { Globe2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type StateOption = { state: string; label: string; enabled: boolean };

export function RegionsManager() {
  const [states, setStates] = useState<StateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/locations/states")
      .then((r) => r.json())
      .then((data) => setStates(data.states ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function toggle(state: string, enabled: boolean) {
    setStates((prev) => prev.map((s) => (s.state === state ? { ...s, enabled } : s)));
    setSaving(state);
    await fetch("/api/admin/regions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state, enabled }),
    });
    setSaving(null);
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex items-center gap-2">
        <Globe2 className="size-4 text-brand-600" />
        <p className="text-sm font-semibold text-foreground">Serviceable regions</p>
      </CardHeader>
      <CardBody>
        <p className="mb-4 text-xs text-muted">
          Only enabled states appear as selectable in sell-pickup and checkout address forms. Everything else shows as &ldquo;coming soon&rdquo;.
        </p>
        {loading ? (
          <p className="text-sm text-muted">Loading states…</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {states.map((s) => (
              <label
                key={s.state}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
                  s.enabled ? "border-brand-300 bg-brand-50/60 text-brand-700" : "border-border text-foreground",
                  saving === s.state && "opacity-50",
                )}
              >
                <input
                  type="checkbox"
                  checked={s.enabled}
                  disabled={saving === s.state}
                  onChange={(e) => toggle(s.state, e.target.checked)}
                  className="size-4 accent-brand-600"
                />
                {s.label}
              </label>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
