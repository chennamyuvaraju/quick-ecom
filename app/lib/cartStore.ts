"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = { id: string; name: string; image?: string; priceClient: number; qty: number };

type CartState = {
	items: CartItem[];
	add: (item: CartItem) => void;
	updateQty: (id: string, qty: number) => void;
	remove: (id: string) => void;
	clear: () => void;
};

export const useCartStore = create<CartState>()(
	persist(
		(set, get) => ({
			items: [],
			add: (item) => {
				const existing = get().items.find((i) => i.id === item.id);
				if (existing) {
					set({ items: get().items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + item.qty } : i)) });
				} else {
					set({ items: [...get().items, item] });
				}
			},
			updateQty: (id, qty) => set({ items: get().items.map((i) => (i.id === id ? { ...i, qty } : i)) }),
			remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
			clear: () => set({ items: [] }),
		}),
		{ name: "uc_cart_v1" }
	)
);