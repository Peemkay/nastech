"use client";

import { useEffect, useState } from "react";
import { Label, Select, Input } from "@/components/ui/Field";
import { DEFAULT_ENABLED_STATE } from "@/lib/constants";

type StateOption = { state: string; label: string; enabled: boolean };

export function LocationSelect({
  state,
  lga,
  onStateChange,
  onLgaChange,
}: {
  state: string;
  lga: string;
  onStateChange: (state: string) => void;
  onLgaChange: (lga: string) => void;
}) {
  const [states, setStates] = useState<StateOption[]>([]);
  const [lgas, setLgas] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingLgas, setLoadingLgas] = useState(false);

  useEffect(() => {
    fetch("/api/locations/states")
      .then((r) => r.json())
      .then((data) => setStates(data.states ?? []))
      .finally(() => setLoadingStates(false));
  }, []);

  useEffect(() => {
    if (!state) return;
    setLoadingLgas(true);
    setLgas([]);
    fetch(`/api/locations/lga?state=${encodeURIComponent(state)}`)
      .then((r) => r.json())
      .then((data) => setLgas(data.lgas ?? []))
      .finally(() => setLoadingLgas(false));
  }, [state]);

  return (
    <>
      <div>
        <Label required>State</Label>
        <Select
          value={state}
          disabled={loadingStates}
          onChange={(e) => {
            onStateChange(e.target.value);
            onLgaChange("");
          }}
        >
          {!states.some((s) => s.state === state) && <option value={state}>{state || "Select state"}</option>}
          {states.map((s) => (
            <option key={s.state} value={s.state} disabled={!s.enabled}>
              {s.label} {!s.enabled && "(coming soon)"}
            </option>
          ))}
        </Select>
        {states.length > 0 && !states.find((s) => s.state === state)?.enabled && (
          <p className="mt-1 text-xs text-amber-600">We don&apos;t deliver to this state yet — pick {DEFAULT_ENABLED_STATE} (Abuja) below or check back soon.</p>
        )}
      </div>
      <div>
        <Label required>LGA / Area Council</Label>
        {lgas.length > 0 ? (
          <Select value={lga} disabled={loadingLgas} onChange={(e) => onLgaChange(e.target.value)}>
            <option value="">{loadingLgas ? "Loading…" : "Select LGA"}</option>
            {lgas.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </Select>
        ) : (
          <Input value={lga} onChange={(e) => onLgaChange(e.target.value)} placeholder={loadingLgas ? "Loading…" : "e.g. Bwari"} />
        )}
      </div>
    </>
  );
}
