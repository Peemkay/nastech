import { ShieldCheck, Landmark, CreditCard, Smartphone as Ussd } from "lucide-react";

const METHODS = [
  { icon: CreditCard, label: "Debit / Credit Card" },
  { icon: Landmark, label: "Bank Transfer" },
  { icon: Ussd, label: "USSD" },
  { icon: ShieldCheck, label: "Paystack & Flutterwave secured" },
];

export function TrustBar() {
  return (
    <section className="border-y border-border bg-surface py-8">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {METHODS.map((m) => (
          <div key={m.label} className="flex items-center gap-2 text-sm font-medium text-muted">
            <m.icon className="size-4.5 text-brand-600" /> {m.label}
          </div>
        ))}
      </div>
    </section>
  );
}
