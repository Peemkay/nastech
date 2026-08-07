"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ProofOfPaymentUploader({ orderCode, existingProofUrl }: { orderCode: string; existingProofUrl?: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(existingProofUrl ?? null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/payments/bank-transfer/upload",
        clientPayload: orderCode,
      });
      setUploadedUrl(blob.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed — please try again");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (uploadedUrl) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-inset ring-green-200">
        <CheckCircle2 className="size-4.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">Proof of payment uploaded</p>
          <p className="text-xs text-green-600">We&apos;ll confirm your payment shortly.</p>
        </div>
        <a href={uploadedUrl} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold underline">
          View
        </a>
      </div>
    );
  }

  return (
    <div>
      <Button variant="secondary" size="sm" icon={uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />} onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? "Uploading…" : "Upload proof of payment"}
      </Button>
      <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      <p className="mt-1.5 text-xs text-muted">Screenshot or receipt of your transfer — JPEG, PNG or PDF, up to 8MB.</p>
    </div>
  );
}
