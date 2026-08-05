"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Label, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PRODUCT_GRADES, GRADE_LABELS } from "@/lib/constants";
import { nairaToKobo } from "@/lib/utils";

type CatalogModel = { id: string; name: string; brandId: string };
type CatalogBrand = { id: string; name: string; categoryId: string; models: CatalogModel[] };
type CatalogCategory = { id: string; name: string; brands: CatalogBrand[] };

export type ProductFormValues = {
  id?: string;
  sku: string;
  name: string;
  slug: string;
  categoryId: string;
  brandId: string;
  modelId: string;
  grade: string;
  storage: string;
  color: string;
  priceNaira: string;
  compareAtPriceNaira: string;
  stock: string;
  imageUrl: string;
  description: string;
  specs: { key: string; value: string }[];
  isActive: boolean;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function ProductForm({ categories, initial }: { categories: CatalogCategory[]; initial?: Partial<ProductFormValues> }) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({
    sku: "",
    name: "",
    slug: "",
    categoryId: categories[0]?.id ?? "",
    brandId: categories[0]?.brands[0]?.id ?? "",
    modelId: "",
    grade: "GOOD",
    storage: "",
    color: "",
    priceNaira: "",
    compareAtPriceNaira: "",
    stock: "1",
    imageUrl: "",
    description: "",
    specs: [{ key: "", value: "" }],
    isActive: true,
    ...initial,
  });
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const brandsForCategory = useMemo(() => categories.find((c) => c.id === values.categoryId)?.brands ?? [], [categories, values.categoryId]);
  const modelsForBrand = useMemo(() => brandsForCategory.find((b) => b.id === values.brandId)?.models ?? [], [brandsForCategory, values.brandId]);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);

    const specs: Record<string, string> = {};
    for (const row of values.specs) if (row.key.trim()) specs[row.key.trim()] = row.value.trim();

    const payload = {
      sku: values.sku,
      name: values.name,
      slug: values.slug,
      categoryId: values.categoryId,
      brandId: values.brandId,
      modelId: values.modelId || null,
      grade: values.grade,
      storage: values.storage || null,
      color: values.color || null,
      priceKobo: nairaToKobo(Number(values.priceNaira) || 0),
      compareAtPriceKobo: values.compareAtPriceNaira ? nairaToKobo(Number(values.compareAtPriceNaira)) : null,
      stock: Number(values.stock) || 0,
      images: values.imageUrl ? [values.imageUrl] : [],
      description: values.description,
      specs,
      isActive: values.isActive,
    };

    const endpoint = values.id ? `/api/admin/products/${values.id}` : "/api/admin/products";
    const res = await fetch(endpoint, {
      method: values.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save product");
      setSubmitting(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader><p className="text-sm font-semibold text-foreground">Basic info</p></CardHeader>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label required>Product name</Label>
              <Input
                value={values.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
                placeholder="e.g. iPhone 13 Pro 128GB — Graphite"
              />
            </div>
            <div>
              <Label required>Slug (URL)</Label>
              <Input value={values.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} />
            </div>
            <div>
              <Label required>SKU</Label>
              <Input value={values.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. NAS-IP13P-128-GRY" />
            </div>
            <div>
              <Label required>Category</Label>
              <Select value={values.categoryId} onChange={(e) => { set("categoryId", e.target.value); set("brandId", categories.find((c) => c.id === e.target.value)?.brands[0]?.id ?? ""); set("modelId", ""); }}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div>
              <Label required>Brand</Label>
              <Select value={values.brandId} onChange={(e) => { set("brandId", e.target.value); set("modelId", ""); }}>
                {brandsForCategory.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Model (optional)</Label>
              <Select value={values.modelId} onChange={(e) => set("modelId", e.target.value)}>
                <option value="">— None —</option>
                {modelsForBrand.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </Select>
            </div>
            <div>
              <Label required>Condition grade</Label>
              <Select value={values.grade} onChange={(e) => set("grade", e.target.value)}>
                {PRODUCT_GRADES.map((g) => <option key={g} value={g}>{GRADE_LABELS[g]}</option>)}
              </Select>
            </div>
            <div>
              <Label>Storage</Label>
              <Input value={values.storage} onChange={(e) => set("storage", e.target.value)} placeholder="e.g. 128GB" />
            </div>
            <div>
              <Label>Color</Label>
              <Input value={values.color} onChange={(e) => set("color", e.target.value)} placeholder="e.g. Graphite" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><p className="text-sm font-semibold text-foreground">Description & specs</p></CardHeader>
          <CardBody>
            <Label>Description</Label>
            <Textarea value={values.description} onChange={(e) => set("description", e.target.value)} className="mb-4" />
            <Label>Specifications</Label>
            <div className="space-y-2">
              {values.specs.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Spec name (e.g. Display)" value={row.key} onChange={(e) => set("specs", values.specs.map((r, ri) => (ri === i ? { ...r, key: e.target.value } : r)))} />
                  <Input placeholder="Value (e.g. 6.1-inch OLED)" value={row.value} onChange={(e) => set("specs", values.specs.map((r, ri) => (ri === i ? { ...r, value: e.target.value } : r)))} />
                  <button type="button" onClick={() => set("specs", values.specs.filter((_, ri) => ri !== i))} className="shrink-0 text-silver-400 hover:text-danger">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="mt-2" icon={<Plus className="size-3.5" />} onClick={() => set("specs", [...values.specs, { key: "", value: "" }])}>
              Add spec
            </Button>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><p className="text-sm font-semibold text-foreground">Pricing & stock</p></CardHeader>
          <CardBody className="space-y-4">
            <div>
              <Label required>Price (₦)</Label>
              <Input type="number" min={0} value={values.priceNaira} onChange={(e) => set("priceNaira", e.target.value)} />
            </div>
            <div>
              <Label>Compare-at price (₦, optional)</Label>
              <Input type="number" min={0} value={values.compareAtPriceNaira} onChange={(e) => set("compareAtPriceNaira", e.target.value)} placeholder="Shown as a strikethrough" />
            </div>
            <div>
              <Label required>Stock quantity</Label>
              <Input type="number" min={0} value={values.stock} onChange={(e) => set("stock", e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={values.isActive} onChange={(e) => set("isActive", e.target.checked)} className="size-4 accent-brand-600" />
              Active (visible in shop)
            </label>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><p className="text-sm font-semibold text-foreground">Image</p></CardHeader>
          <CardBody>
            <Label>Image URL (optional)</Label>
            <Input value={values.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://…" />
            <p className="mt-1.5 text-xs text-muted">Leave blank to use a placeholder graphic.</p>
          </CardBody>
        </Card>

        {error && (
          <p className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
            <AlertCircle className="size-4 shrink-0" /> {error}
          </p>
        )}

        <Button fullWidth size="lg" onClick={submit} loading={submitting}>
          {values.id ? "Save changes" : "Create product"}
        </Button>
      </div>
    </div>
  );
}
