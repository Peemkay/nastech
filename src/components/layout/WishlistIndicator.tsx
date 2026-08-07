"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useWishlistStore } from "@/lib/wishlist-store";

export function WishlistIndicator() {
  const count = useWishlistStore((s) => s.count());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Link
      href="/wishlist"
      aria-label="Wishlist"
      className="relative inline-flex size-10 items-center justify-center rounded-full text-foreground transition hover:bg-brand-50"
    >
      <Heart className="size-5" />
      {mounted && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-4.5 min-w-4.5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
