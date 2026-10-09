import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  shopName: string;
  marketZone: string;
  category: string;
  stock?: number;
  rating?: number;
  selectedSize?: string;
  selectedColor?: string;
  sellerId?: string;
}

export interface CartItem extends CartProduct {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartStore {
  items: CartItem[];
  favorites: CartProduct[];
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItemOptions: (id: string, options: { size?: string; color?: string }) => void;
  clearCart: () => void;
  toggleFavorite: (product: CartProduct) => boolean;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  addAllFavoritesToCart: () => void;
  isFavorite: (id: string) => boolean;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      favorites: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { ...product, quantity }],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      updateItemOptions: (id, options) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  selectedSize: options.size !== undefined ? options.size : item.selectedSize,
                  selectedColor: options.color !== undefined ? options.color : item.selectedColor,
                }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      toggleFavorite: (product) => {
        let isNowFav = false;
        set((state) => {
          const exists = state.favorites.some((f) => f.id === product.id);
          if (exists) {
            isNowFav = false;
            return {
              favorites: state.favorites.filter((f) => f.id !== product.id),
            };
          }
          isNowFav = true;
          return {
            favorites: [...state.favorites, product],
          };
        });
        return isNowFav;
      },

      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        }));
      },

      clearFavorites: () => {
        set({ favorites: [] });
      },

      addAllFavoritesToCart: () => {
        set((state) => {
          let updatedItems = [...state.items];
          for (const fav of state.favorites) {
            const existingIndex = updatedItems.findIndex((item) => item.id === fav.id);
            if (existingIndex > -1) {
              updatedItems[existingIndex] = {
                ...updatedItems[existingIndex],
                quantity: updatedItems[existingIndex].quantity + 1,
              };
            } else {
              updatedItems.push({
                ...fav,
                quantity: 1,
              });
            }
          }
          return {
            items: updatedItems,
            favorites: [],
          };
        });
      },

      isFavorite: (id) => {
        return get().favorites.some((f) => f.id === id);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "mercatox-cart-storage",
    }
  )
);
