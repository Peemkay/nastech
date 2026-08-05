"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  image?: string;
  priceKobo: number;
  grade: string;
  quantity: number;
  maxStock: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, qty: number) => void;
  clear: () => void;
  subtotalKobo: () => number;
  count: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            const nextQty = Math.min(existing.quantity + qty, existing.maxStock);
            return {
              items: state.items.map((i) => (i.productId === item.productId ? { ...i, quantity: nextQty } : i)),
            };
          }
          return { items: [...state.items, { ...item, quantity: Math.min(qty, item.maxStock) }] };
        }),
      remove: (productId) => set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      setQuantity: (productId, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxStock)) } : i,
          ),
        })),
      clear: () => set({ items: [] }),
      subtotalKobo: () => get().items.reduce((sum, i) => sum + i.priceKobo * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "nastech-cart" },
  ),
);
