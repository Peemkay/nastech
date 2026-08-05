import { ClipboardList, Truck, SearchCheck, Banknote } from "lucide-react";
import { SectionHeading } from "@/components/ui/Misc";

const STEPS = [
  { icon: ClipboardList, title: "Get your quote", desc: "Tell us your device's brand, model & condition for an instant price." },
  { icon: Truck, title: "Schedule pickup", desc: "Pick a free doorstep pickup slot anywhere in Nigeria, or drop it off." },
  { icon: SearchCheck, title: "Quick inspection", desc: "Our technician verifies the condition against what you told us." },
  { icon: Banknote, title: "Get paid instantly", desc: "Receive your Naira payout via bank transfer within 24 hours." },
];

export function HowItWorks() {
  return (
    <section className="bg-silver-100/50 py-16">
      <div className="container-page">
        <SectionHeading align="center" eyebrow="How it works" title="Turn your old device into cash in 4 easy steps" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative rounded-2xl border border-border bg-surface p-6">
              <span className="absolute -top-3 -left-3 flex size-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white shadow-md">
                {i + 1}
              </span>
              <step.icon className="size-7 text-brand-600" />
              <p className="mt-4 text-sm font-semibold text-foreground">{step.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
