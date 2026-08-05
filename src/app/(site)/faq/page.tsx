import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Misc";

export const metadata: Metadata = { title: "Frequently Asked Questions" };

const FAQS = [
  {
    q: "How does the instant quote work?",
    a: "Select your device's category, brand and model, then answer a few quick questions about its condition. We calculate an instant, no-obligation cash estimate based on your answers — no need to visit a store.",
  },
  {
    q: "Is the quoted price final?",
    a: "Your quote is an estimate based on what you tell us. When our technician inspects the device at pickup, if the actual condition matches your answers, you're paid the full quoted amount. If it differs, we'll share a revised offer before you accept — you're never obligated to sell.",
  },
  {
    q: "How do I get paid?",
    a: "Once your device passes inspection, payment is sent directly to your Nigerian bank account, or via Paystack/Flutterwave, usually within 24 hours.",
  },
  {
    q: "Which payment methods do you accept for purchases?",
    a: "We accept Nigerian debit/credit cards, bank transfer and USSD through Paystack and Flutterwave, as well as direct bank transfer with manual confirmation.",
  },
  {
    q: "Do refurbished devices come with a warranty?",
    a: "Yes — every device sold on NASTECH comes with a 12-month warranty and has passed a 40-point quality inspection before listing.",
  },
  {
    q: "Which cities do you cover?",
    a: "We offer free doorstep pickup and delivery in Lagos, Abuja, Port Harcourt and 20+ other Nigerian cities, with nationwide delivery available everywhere else.",
  },
  {
    q: "How can I track my order or sell request?",
    a: "Use the tracking code sent to your email, or visit the Track Order page and enter your NAS-ORD- or NAS-SEL- code to see live status updates.",
  },
];

export default function FAQPage() {
  return (
    <Container className="max-w-3xl py-14">
      <SectionHeading align="center" eyebrow="FAQ" title="Frequently asked questions" />
      <div className="space-y-3">
        {FAQS.map((item) => (
          <details key={item.q} className="group rounded-2xl border border-border bg-surface p-5 open:border-brand-200">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground">
              {item.q}
              <ChevronDown className="size-4 shrink-0 text-muted transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </Container>
  );
}
