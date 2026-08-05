"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea, Label } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    if (res.status === 401) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not submit review.");
      setSubmitting(false);
      return;
    }
    setDone(true);
    setSubmitting(false);
    router.refresh();
  }

  return (
    <Card>
      <CardBody>
        <p className="mb-4 text-sm font-semibold text-foreground">Write a review</p>
        {done ? (
          <p className="text-sm text-green-700">Thanks — your review has been posted!</p>
        ) : (
          <>
            <Label>Your rating</Label>
            <div className="mb-4 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                  <Star className={cn("size-6 transition", n <= rating ? "fill-amber-400 text-amber-400" : "text-silver-300")} />
                </button>
              ))}
            </div>
            <Label>Comment (optional)</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience with this device…" />
            {error && <p className="mt-2 text-xs text-danger">{error}</p>}
            <Button className="mt-4" onClick={submit} loading={submitting}>
              Submit review
            </Button>
          </>
        )}
      </CardBody>
    </Card>
  );
}
