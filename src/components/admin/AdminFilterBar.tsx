"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui/Field";

export function AdminFilterBar({
  searchPlaceholder = "Search…",
  statusOptions,
  statusKey = "status",
}: {
  searchPlaceholder?: string;
  statusOptions?: { value: string; label: string }[];
  statusKey?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
        <Input
          defaultValue={searchParams.get("q") ?? ""}
          placeholder={searchPlaceholder}
          className="pl-10"
          onKeyDown={(e) => e.key === "Enter" && update("q", (e.target as HTMLInputElement).value)}
        />
      </div>
      {statusOptions && (
        <Select defaultValue={searchParams.get(statusKey) ?? ""} onChange={(e) => update(statusKey, e.target.value)} className="sm:w-56">
          <option value="">All statuses</option>
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
      )}
    </div>
  );
}
