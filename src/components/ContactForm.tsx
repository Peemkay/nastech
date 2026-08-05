"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Label, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <CheckCircle2 className="size-8 text-green-600" />
        <p className="text-sm font-semibold text-foreground">Message sent!</p>
        <p className="text-sm text-muted">Our support team will get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitting(true);
        setTimeout(() => {
          setSubmitting(false);
          setSent(true);
        }, 500);
      }}
    >
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label required>Full name</Label>
          <Input required placeholder="Your name" />
        </div>
        <div>
          <Label required>Email address</Label>
          <Input type="email" required placeholder="you@example.com" />
        </div>
      </div>
      <div className="mb-4">
        <Label required>Subject</Label>
        <Input required placeholder="How can we help?" />
      </div>
      <div className="mb-5">
        <Label required>Message</Label>
        <Textarea required placeholder="Tell us more…" />
      </div>
      <Button type="submit" loading={submitting}>Send message</Button>
    </form>
  );
}
