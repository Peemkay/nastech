import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, MapPinned, ShieldCheck, Truck, Users, Wallet } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Misc";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "About Us" };

const VALUES = [
  { icon: Wallet, title: "Fair, instant pricing", desc: "Transparent quotes based on real market value — no lowball offers, no hidden fees." },
  { icon: ShieldCheck, title: "Trust & security", desc: "Every transaction is protected, and every refurbished device is quality-checked and warrantied." },
  { icon: Truck, title: "Convenience first", desc: "Free doorstep pickup and nationwide delivery — we come to you, wherever you are in Nigeria." },
  { icon: Users, title: "People-powered", desc: "A growing team of Nigerian technicians, logistics partners and support staff behind every order." },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,var(--brand-100),transparent)]">
        <div className="container-page flex flex-col items-center py-14 text-center sm:py-20">
          <Image
            src="/logo-full.png"
            alt="NASTECH Gadgets — Smart Tech. Better Life."
            width={1080}
            height={1080}
            priority
            className="h-auto w-56 drop-shadow-xl sm:w-72"
          />
        </div>
      </section>

      <Container className="py-14">
        <SectionHeading
          align="center"
          eyebrow="About NASTECH"
          title="Smart Tech. Better Life."
          subtitle="NASTECH Gadgets is Nigeria's upgraded marketplace to sell, trade-in, repair-check and buy certified refurbished phones, laptops, tablets and smartwatches — built for how Nigerians actually shop for tech."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          {VALUES.map((v) => (
            <div key={v.title} className="flex gap-4 rounded-2xl border border-border bg-surface p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <v.icon className="size-5.5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{v.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-border bg-silver-100/50 p-8 text-center">
          <MapPinned className="mx-auto size-8 text-brand-600" />
          <p className="mt-3 text-lg font-bold text-foreground">Proudly Nigerian, built for Nigeria</p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            From Lagos to Abuja to Port Harcourt and beyond, we accept Naira payments through Paystack, Flutterwave and
            direct bank transfer — no foreign cards required.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <BadgeCheck className="size-6 text-brand-600" />
          <p className="max-w-lg text-sm text-muted">
            Have an old device gathering dust? Find out what it&apos;s worth in under 2 minutes.
          </p>
          <LinkButton href="/sell" className="mt-2">Get an instant quote</LinkButton>
        </div>
      </Container>
    </>
  );
}
