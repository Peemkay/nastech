"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn, nairaToKobo } from "@/lib/utils";
import { CATEGORY_ICONS } from "@/lib/constants";

type Option = { id: string; label: string; deductionBps: number };
type Question = { id: string; question: string; options: Option[] };
type ModelT = { id: string; name: string; slug: string; baseValueKobo: number; storageOptions: unknown };
type BrandT = { id: string; name: string; slug: string; models: ModelT[] };
type CategoryT = { id: string; name: string; slug: string; icon: string; brands: BrandT[]; conditionQuestions: Question[] };

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Request failed");
  }
  return res.json();
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function CatalogManager({ categories }: { categories: CategoryT[] }) {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id ?? "");
  const [selectedBrandId, setSelectedBrandId] = useState(categories[0]?.brands[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const category = categories.find((c) => c.id === selectedCategoryId) ?? categories[0];
  const brand = category?.brands.find((b) => b.id === selectedBrandId) ?? category?.brands[0];

  function refresh() {
    router.refresh();
  }

  async function withBusy(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Card className="h-fit">
        <CardHeader><p className="text-sm font-semibold text-foreground">Categories</p></CardHeader>
        <CardBody className="space-y-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelectedCategoryId(c.id); setSelectedBrandId(c.brands[0]?.id ?? ""); }}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition",
                c.id === selectedCategoryId ? "bg-brand-600 text-white" : "text-foreground hover:bg-brand-50",
              )}
            >
              {c.name}
              <span className={cn("text-xs", c.id === selectedCategoryId ? "text-brand-100" : "text-muted")}>{c.brands.length} brands</span>
            </button>
          ))}
          <NewCategoryForm
            onAdd={(name, icon) =>
              withBusy(() => call("/api/admin/categories", "POST", { name, slug: slugify(name), icon, sortOrder: categories.length }))
            }
          />
        </CardBody>
      </Card>

      {category && (
        <div className="space-y-6">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}

          <Card>
            <CardHeader className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Brands in {category.name}</p>
            </CardHeader>
            <CardBody className="space-y-2">
              {category.brands.map((b) => (
                <EditRow
                  key={b.id}
                  fields={[{ key: "name", value: b.name, placeholder: "Brand name" }]}
                  onSave={(v) => withBusy(() => call(`/api/admin/brands/${b.id}`, "PATCH", { name: v.name, slug: slugify(v.name) }))}
                  onDelete={() => withBusy(() => call(`/api/admin/brands/${b.id}`, "DELETE"))}
                  disabled={busy}
                  selected={b.id === selectedBrandId}
                  onClick={() => setSelectedBrandId(b.id)}
                />
              ))}
              <EditRow
                fields={[{ key: "name", value: "", placeholder: "New brand name" }]}
                isNew
                onSave={(v) => v.name && withBusy(() => call("/api/admin/brands", "POST", { categoryId: category.id, name: v.name, slug: slugify(v.name) }))}
                disabled={busy}
              />
            </CardBody>
          </Card>

          {brand && (
            <Card>
              <CardHeader><p className="text-sm font-semibold text-foreground">Models — {brand.name}</p></CardHeader>
              <CardBody className="space-y-2">
                {brand.models.map((m) => {
                  const storage = Array.isArray(m.storageOptions) ? (m.storageOptions as string[]).join(", ") : "";
                  return (
                    <EditRow
                      key={m.id}
                      fields={[
                        { key: "name", value: m.name, placeholder: "Model name" },
                        { key: "baseValueNaira", value: String(m.baseValueKobo / 100), placeholder: "Base value ₦", type: "number" },
                        { key: "storage", value: storage, placeholder: "Storage options, comma separated" },
                      ]}
                      onSave={(v) =>
                        withBusy(() =>
                          call(`/api/admin/models/${m.id}`, "PATCH", {
                            name: v.name,
                            slug: slugify(v.name),
                            baseValueKobo: nairaToKobo(Number(v.baseValueNaira) || 0),
                            storageOptions: v.storage ? v.storage.split(",").map((s) => s.trim()).filter(Boolean) : [],
                          }),
                        )
                      }
                      onDelete={() => withBusy(() => call(`/api/admin/models/${m.id}`, "DELETE"))}
                      disabled={busy}
                    />
                  );
                })}
                <EditRow
                  fields={[
                    { key: "name", value: "", placeholder: "New model name" },
                    { key: "baseValueNaira", value: "", placeholder: "Base value ₦", type: "number" },
                    { key: "storage", value: "", placeholder: "e.g. 64GB, 128GB, 256GB" },
                  ]}
                  isNew
                  onSave={(v) =>
                    v.name &&
                    withBusy(() =>
                      call("/api/admin/models", "POST", {
                        brandId: brand.id,
                        name: v.name,
                        slug: slugify(v.name),
                        baseValueKobo: nairaToKobo(Number(v.baseValueNaira) || 0),
                        storageOptions: v.storage ? v.storage.split(",").map((s) => s.trim()).filter(Boolean) : [],
                      }),
                    )
                  }
                  disabled={busy}
                />
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader><p className="text-sm font-semibold text-foreground">Condition questions — {category.name}</p></CardHeader>
            <CardBody className="space-y-5">
              {category.conditionQuestions.map((q) => (
                <div key={q.id} className="rounded-xl border border-border p-4">
                  <EditRow
                    fields={[{ key: "question", value: q.question, placeholder: "Question" }]}
                    onSave={(v) => withBusy(() => call(`/api/admin/condition-questions/${q.id}`, "PATCH", { question: v.question, sortOrder: 0 }))}
                    onDelete={() => withBusy(() => call(`/api/admin/condition-questions/${q.id}`, "DELETE"))}
                    disabled={busy}
                  />
                  <div className="mt-3 space-y-2 border-t border-border pt-3">
                    <p className="text-xs font-semibold text-muted uppercase">Answer options & value deduction</p>
                    {q.options.map((o) => (
                      <EditRow
                        key={o.id}
                        compact
                        fields={[
                          { key: "label", value: o.label, placeholder: "Option label" },
                          { key: "deductionPct", value: String(o.deductionBps / 100), placeholder: "% deducted", type: "number" },
                        ]}
                        onSave={(v) =>
                          withBusy(() =>
                            call(`/api/admin/condition-options/${o.id}`, "PATCH", { label: v.label, deductionBps: Math.round(Number(v.deductionPct) * 100), sortOrder: 0 }),
                          )
                        }
                        onDelete={() => withBusy(() => call(`/api/admin/condition-options/${o.id}`, "DELETE"))}
                        disabled={busy}
                      />
                    ))}
                    <EditRow
                      compact
                      isNew
                      fields={[
                        { key: "label", value: "", placeholder: "New option label" },
                        { key: "deductionPct", value: "0", placeholder: "% deducted", type: "number" },
                      ]}
                      onSave={(v) =>
                        v.label &&
                        withBusy(() =>
                          call("/api/admin/condition-options", "POST", { questionId: q.id, label: v.label, deductionBps: Math.round(Number(v.deductionPct) * 100), sortOrder: q.options.length }),
                        )
                      }
                      disabled={busy}
                    />
                  </div>
                </div>
              ))}
              <EditRow
                fields={[{ key: "question", value: "", placeholder: "New question, e.g. Does the screen have any scratches?" }]}
                isNew
                onSave={(v) => v.question && withBusy(() => call("/api/admin/condition-questions", "POST", { categoryId: category.id, question: v.question, sortOrder: category.conditionQuestions.length }))}
                disabled={busy}
              />
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

function NewCategoryForm({ onAdd }: { onAdd: (name: string, icon: string) => void }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("smartphone");
  return (
    <div className="rounded-xl border border-dashed border-border p-3">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" className="mb-2" />
      <Select value={icon} onChange={(e) => setIcon(e.target.value)} className="mb-2">
        {Object.entries(CATEGORY_ICONS).map(([slug, ic]) => <option key={slug} value={ic}>{ic}</option>)}
      </Select>
      <Button size="sm" fullWidth icon={<Plus className="size-3.5" />} onClick={() => { if (name) { onAdd(name, icon); setName(""); } }}>
        Add category
      </Button>
    </div>
  );
}

type FieldDef = { key: string; value: string; placeholder: string; type?: string };

function EditRow({
  fields,
  onSave,
  onDelete,
  isNew,
  disabled,
  compact,
  selected,
  onClick,
}: {
  fields: FieldDef[];
  onSave?: (values: Record<string, string>) => void;
  onDelete?: () => void;
  isNew?: boolean;
  disabled?: boolean;
  compact?: boolean;
  selected?: boolean;
  onClick?: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(fields.map((f) => [f.key, f.value])));

  return (
    <div className={cn("flex items-center gap-2 rounded-lg", selected && "ring-2 ring-brand-200 bg-brand-50/50 -mx-2 px-2 py-1")} onClick={onClick}>
      {fields.map((f) => (
        <Input
          key={f.key}
          type={f.type ?? "text"}
          value={values[f.key]}
          onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
          placeholder={f.placeholder}
          className={compact ? "h-9 text-xs" : ""}
        />
      ))}
      {onSave && (
        <button disabled={disabled} onClick={(e) => { e.stopPropagation(); onSave(values); }} className="shrink-0 rounded-full p-2 text-brand-600 hover:bg-brand-50 disabled:opacity-40" aria-label="Save">
          {isNew ? <Plus className="size-4" /> : <Save className="size-4" />}
        </button>
      )}
      {onDelete && (
        <button disabled={disabled} onClick={(e) => { e.stopPropagation(); onDelete(); }} className="shrink-0 rounded-full p-2 text-silver-400 hover:bg-red-50 hover:text-danger disabled:opacity-40" aria-label="Delete">
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}
