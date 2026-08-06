import { Wrench, Smartphone, Cpu, ShieldCheck } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

const POINTS = [
  { icon: Smartphone, text: "Screen, battery, charging port & more" },
  { icon: Cpu, text: "Software issues, OS reinstalls, virus removal" },
  { icon: ShieldCheck, text: "Genuine parts, warrantied work" },
];

export function RepairPromo() {
  return (
    <section className="container-page py-16">
      <div className="grid items-center gap-8 rounded-[2rem] border border-border bg-surface p-8 sm:p-12 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
            <Wrench className="size-3.5" /> Repair services
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Cracked screen? Won&apos;t turn on? We fix it.</h2>
          <p className="mt-3 max-w-md text-muted">
            Hardware or software, we&apos;ve got it covered — free diagnosis, upfront pricing, and drop-off or doorstep pickup.
          </p>
          <LinkButton href="/repair" size="lg" className="mt-6">
            Book a repair
          </LinkButton>
        </div>
        <div className="space-y-3">
          {POINTS.map((p) => (
            <div key={p.text} className="flex items-center gap-3 rounded-xl bg-silver-100/60 px-4 py-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
                <p.icon className="size-4.5" />
              </span>
              <p className="text-sm font-medium text-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
