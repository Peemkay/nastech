import { LinkButton } from "@/components/ui/Button";
import { ShieldCheck, Truck, Wallet, Smartphone, Laptop, Watch, Sparkles } from "lucide-react";

const STATS = [
  { label: "Devices traded in", value: "50,000+" },
  { label: "Cities covered", value: "20+" },
  { label: "Avg. payout time", value: "< 24 hrs" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,var(--brand-100),transparent)]">
      <div className="container-page grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:py-28">
        <div className="animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
            <Sparkles className="size-3.5" /> Nigeria&apos;s upgraded gadget marketplace
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
            Sell your old gadget.
            <br />
            <span className="text-brand-600">Get paid in Naira,</span> instantly.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            Get an instant, fair price for your phone, laptop, tablet or smartwatch — free doorstep pickup across
            Nigeria and same-day payment via Paystack, Flutterwave or bank transfer. Or shop certified refurbished
            devices at up to 40% off.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/sell" size="lg">
              <Wallet className="size-4.5" /> Get Instant Quote
            </LinkButton>
            <LinkButton href="/shop" variant="secondary" size="lg">
              Shop Refurbished
            </LinkButton>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-6">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="text-xl font-extrabold text-foreground sm:text-2xl">{s.value}</dt>
                <dd className="mt-0.5 text-xs text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-200/50 via-transparent to-silver-200/50 blur-2xl" />
          <div className="rounded-[2rem] border border-border bg-surface p-6 shadow-xl shadow-brand-900/5">
            <p className="text-sm font-semibold text-foreground">Get your instant quote</p>
            <p className="text-xs text-muted">Answer a few quick questions</p>

            <div className="mt-5 grid grid-cols-4 gap-2.5">
              {[Smartphone, Laptop, Watch, Truck].map((Icon, i) => (
                <div
                  key={i}
                  className="flex aspect-square items-center justify-center rounded-xl border border-border bg-brand-50/60 text-brand-600"
                >
                  <Icon className="size-6" />
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl bg-brand-950 bg-[#071129] p-4 text-white">
              <p className="text-xs text-brand-200">Estimated value</p>
              <p className="mt-1 text-2xl font-extrabold">₦285,000</p>
              <p className="mt-1 text-[11px] text-brand-300">iPhone 13 Pro · 128GB · Good condition</p>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-200">
              <ShieldCheck className="size-4 shrink-0" /> Free pickup · Paid within 24 hours
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
