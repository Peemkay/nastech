"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { MAIN_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MobileMenu({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        aria-label="Toggle menu"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex size-10 items-center justify-center rounded-full hover:bg-brand-50"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <div
        className={cn(
          "absolute inset-x-0 top-full z-40 origin-top border-b border-border bg-surface shadow-lg transition-all duration-200",
          open ? "scale-y-100 opacity-100" : "pointer-events-none scale-y-95 opacity-0",
        )}
      >
        <nav className="container-page flex flex-col gap-1 py-4">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-brand-50"
            >
              {item.label}
            </Link>
          ))}
          <div className="my-2 h-px bg-border" />
          <Link
            href={loggedIn ? "/account" : "/login"}
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-brand-50"
          >
            {loggedIn ? "My Account" : "Login / Register"}
          </Link>
        </nav>
      </div>
    </div>
  );
}
