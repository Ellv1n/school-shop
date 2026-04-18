import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }
        set({ user, token });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        set({ user: null, token: null });
        toast.success('Çıxış edildi');
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          get().setAuth(data.data.user, data.data.token);
          toast.success(`Xoş gəldiniz, ${data.data.user.name}!`);
          return data.data;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (formData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', formData);
          get().setAuth(data.data.user, data.data.token);
          toast.success('Qeydiyyat uğurla tamamlandı!');
          return data.data;
        } finally {
          set({ isLoading: false });
        }
      },

      refreshProfile: async () => {
        try {
          const { data } = await api.get('/auth/profile');
          set({ user: data.data });
        } catch {}
      },

      isAdmin: () => get().user?.role === 'ADMIN',
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
