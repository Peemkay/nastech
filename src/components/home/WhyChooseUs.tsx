import { Wallet, Truck, ShieldCheck, BadgeCheck, Headset, MapPinned } from "lucide-react";
import { SectionHeading } from "@/components/ui/Misc";

const POINTS = [
  { icon: Wallet, title: "Instant Naira payouts", desc: "Get paid via Paystack, Flutterwave or direct bank transfer — no delays." },
  { icon: Truck, title: "Free doorstep pickup", desc: "We come to you anywhere in Nigeria, at no extra cost." },
  { icon: BadgeCheck, title: "Certified refurbished", desc: "Every device we sell passes a 40-point quality check with grading." },
  { icon: ShieldCheck, title: "12-month warranty", desc: "All refurbished purchases are covered for a full year." },
  { icon: MapPinned, title: "Nationwide coverage", desc: "Serving Lagos, Abuja, Port Harcourt and 20+ Nigerian cities." },
  { icon: Headset, title: "Real human support", desc: "Reach our support team by phone, email or WhatsApp — 7 days a week." },
];

export function WhyChooseUs() {
  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="Why NASTECH" title="Built for how Nigerians buy and sell gadgets" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {POINTS.map((p) => (
          <div key={p.title} className="flex gap-4 rounded-2xl border border-border bg-surface p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <p.icon className="size-5.5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{p.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
