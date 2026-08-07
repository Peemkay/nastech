import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";
import { Container } from "@/components/ui/Misc";

// lucide-react dropped brand/social icons — use simple text monograms instead.
const SOCIALS = [
  { label: "Facebook", initial: "f" },
  { label: "Instagram", initial: "IG" },
  { label: "X", initial: "X" },
];

const columns = [
  {
    title: "Sell / Trade-in",
    links: [
      { href: "/sell", label: "Sell your phone" },
      { href: "/sell", label: "Sell your laptop" },
      { href: "/track", label: "Track a sell request" },
    ],
  },
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "Refurbished phones" },
      { href: "/shop", label: "Refurbished laptops" },
      { href: "/track", label: "Track an order" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About NASTECH" },
      { href: "/faq", label: "FAQs" },
      { href: "/contact", label: "Contact us" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-brand-950 bg-[#071129] text-silver-300">
      <Container className="grid grid-cols-2 gap-10 py-14 sm:grid-cols-6">
        <div className="col-span-2 sm:col-span-2">
          <div className="[&_span]:text-white [&_span.text-brand-600]:text-brand-400">
            <Logo />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-silver-400">
            Nigeria&apos;s upgraded marketplace to sell, trade-in and buy certified refurbished phones, laptops,
            tablets and smartwatches — instant Naira payouts, doorstep pickup, nationwide delivery.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="flex size-9 items-center justify-center rounded-full bg-white/5 text-xs font-bold text-silver-300 transition hover:bg-brand-600 hover:text-white"
              >
                {s.initial}
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="col-span-1 sm:col-span-1">
            <p className="text-sm font-semibold text-white">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="text-sm text-silver-400 transition hover:text-brand-400">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-2 sm:col-span-2">
          <p className="text-sm font-semibold text-white">Get in touch</p>
          <ul className="mt-4 space-y-3 text-sm text-silver-400">
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-brand-400" /> +234 800 000 0000
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-brand-400" /> support@nastech.ng
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-400" /> Lagos · Abuja · Port Harcourt
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-xs text-silver-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} NASTECH Gadgets Ltd. All rights reserved.
            <span className="mx-2 text-silver-600">·</span>
            Designed by{" "}
            <a
              href="https://peemkaytech.com.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-silver-400 transition hover:text-brand-400"
            >
              PeemkayTECH
            </a>
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-brand-400" /> Secure Nigerian payments
            </span>
            <span className="rounded border border-white/10 px-2 py-1 font-medium tracking-wide">Paystack</span>
            <span className="rounded border border-white/10 px-2 py-1 font-medium tracking-wide">Flutterwave</span>
            <span className="rounded border border-white/10 px-2 py-1 font-medium tracking-wide">Bank Transfer</span>
          </div>
        </Container>
      </div>
    </footer>
  );
}
