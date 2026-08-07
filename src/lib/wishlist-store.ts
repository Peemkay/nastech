"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistItem = {
  productId: string;
  name: string;
  slug: string;
  image?: string;
  priceKobo: number;
  grade: string;
  addedAt: number;
};

type WishlistState = {
  items: WishlistItem[];
  toggle: (item: Omit<WishlistItem, "addedAt">) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  count: () => number;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId);
          if (exists) return { items: state.items.filter((i) => i.productId !== item.productId) };
          return { items: [{ ...item, addedAt: Date.now() }, ...state.items] };
        }),
      remove: (productId) => set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      has: (productId) => get().items.some((i) => i.productId === productId),
      count: () => get().items.length,
    }),
    { name: "nastech-wishlist" },
  ),
);
