import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],          // local guest cart
      serverCart: null,   // authenticated cart from server
      isLoading: false,
      isOpen: false,

      setOpen: (isOpen) => set({ isOpen }),

      // ─── Server cart (authenticated) ───────────────────
      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.get('/cart');
          set({ serverCart: data.data });
        } catch {} finally {
          set({ isLoading: false });
        }
      },

      addToCartServer: async (productId, quantity = 1) => {
        try {
          await api.post('/cart/add', { productId, quantity });
          await get().fetchCart();
          toast.success('Səbətə əlavə edildi');
        } catch (error) {
          toast.error(getErrorMessage(error));
          throw error;
        }
      },

      updateCartItemServer: async (itemId, quantity) => {
        try {
          await api.put(`/cart/items/${itemId}`, { quantity });
          await get().fetchCart();
        } catch (error) {
          toast.error(getErrorMessage(error));
        }
      },

      removeFromCartServer: async (itemId) => {
        try {
          await api.delete(`/cart/items/${itemId}`);
          await get().fetchCart();
          toast.success('Məhsul səbətdən çıxarıldı');
        } catch (error) {
          toast.error(getErrorMessage(error));
        }
      },

      clearCartServer: async () => {
        try {
          await api.delete('/cart/clear');
          set({ serverCart: null });
        } catch {}
      },

      // ─── Local guest cart ─────────────────────────────
      addToCartLocal: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find(i => i.productId === product.id);
        if (existing) {
          set({ items: items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i) });
        } else {
          set({ items: [...items, { productId: product.id, product, quantity }] });
        }
        toast.success('Səbətə əlavə edildi');
      },

      removeFromCartLocal: (productId) => {
        set({ items: get().items.filter(i => i.productId !== productId) });
      },

      updateQuantityLocal: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCartLocal(productId);
          return;
        }
        set({ items: get().items.map(i => i.productId === productId ? { ...i, quantity } : i) });
      },

      clearLocal: () => set({ items: [] }),

      // ─── Computed ─────────────────────────────────────
      getItemCount: (isAuth) => {
        if (isAuth) {
          const cart = get().serverCart;
          return cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
        }
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      getTotal: (isAuth) => {
        if (isAuth) return parseFloat(get().serverCart?.total || 0);
        return get().items.reduce((sum, i) => sum + (parseFloat(i.product?.price || 0) * i.quantity), 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
