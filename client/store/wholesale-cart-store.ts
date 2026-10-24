import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WholesaleCartItem {
  id: string;
  name: string;
  price: number; // Unit price after volume tier discount
  originalPrice: number;
  image?: string;
  supplierShopName: string;
  category: string;
  moq: number;
  unit: string;
  quantity: number;
  savingsPercent?: number;
  marketZone?: string;
}

interface WholesaleCartStore {
  items: WholesaleCartItem[];
  addItem: (item: WholesaleCartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalUnits: () => number;
  getTotalAmount: () => number;
}

export const useWholesaleCartStore = create<WholesaleCartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      quantity: item.quantity,
                      price: item.price,
                      savingsPercent: item.savingsPercent,
                    }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, item],
          };
        });
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (!item) return state;
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.id !== id) };
          }
          const safeQty = Math.max(item.moq || 1, quantity);
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: safeQty } : i
            ),
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.length,

      getTotalUnits: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotalAmount: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: "mercatox-wholesale-cart-v1",
    }
  )
);
