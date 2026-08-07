import Link from "next/link";
import { Phone, User } from "lucide-react";
import { auth } from "@/lib/auth";
import { MAIN_NAV, SITE_TAGLINE } from "@/lib/constants";
import { Logo } from "./Logo";
import { CartIndicator } from "./CartIndicator";
import { WishlistIndicator } from "./WishlistIndicator";
import { MobileMenu } from "./MobileMenu";
import { LinkButton } from "@/components/ui/Button";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur">
      <div className="hidden bg-brand-900 text-white sm:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <span className="text-brand-100">{SITE_TAGLINE} — Nigeria&apos;s trusted gadget marketplace</span>
          <a href="tel:+2348000000000" className="flex items-center gap-1.5 text-brand-100 hover:text-white">
            <Phone className="size-3.5" /> +234 800 000 0000
          </a>
        </div>
      </div>

      <div className="relative container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 sm:flex">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground/80 transition hover:bg-brand-50 hover:text-brand-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <LinkButton href="/sell" size="sm" className="hidden sm:inline-flex">
            Sell Now
          </LinkButton>
          <WishlistIndicator />
          <CartIndicator />
          <Link
            href={session ? "/account" : "/login"}
            aria-label="Account"
            className="hidden size-10 items-center justify-center rounded-full text-foreground hover:bg-brand-50 sm:inline-flex"
          >
            <User className="size-5" />
          </Link>
          <MobileMenu loggedIn={!!session} />
        </div>
      </div>
    </header>
  );
}
