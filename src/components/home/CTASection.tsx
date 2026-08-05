import { LinkButton } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="container-page py-16">
      <div className="brand-gradient relative overflow-hidden rounded-[2rem] px-6 py-14 text-center sm:px-16">
        <div className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-72 rounded-full bg-white/10" />
        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          That old phone in your drawer is worth real cash.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-brand-100">
          Get a free instant quote in under 2 minutes — no obligation to sell.
        </p>
        <LinkButton href="/sell" variant="secondary" size="lg" className="mt-7 !bg-white !text-brand-700 hover:!bg-brand-50">
          Get My Free Quote <ArrowRight className="size-4.5" />
        </LinkButton>
      </div>
    </section>
  );
}
