'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { User, Package, Settings, Save } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/shop/CartDrawer';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, setAuth, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) router.push('/login');
    else if (user) reset({ name: user.name, phone: user.phone || '', address: user.address || '' });
  }, [user]);

  const mutation = useMutation({
    mutationFn: (data) => api.put('/auth/profile', data),
    onSuccess: (res) => {
      toast.success('Profil yeniləndi');
      setAuth(res.data.data, token);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (!mounted) {
    return (
      <>
        <Header /><CartDrawer />
        <main className="page-container py-10">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="skeleton h-20 rounded-2xl animate-pulse bg-slate-200" />
            <div className="skeleton h-64 rounded-2xl animate-pulse bg-slate-200" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header /><CartDrawer />
      <main className="page-container py-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">{user?.name}</h1>
              <p className="text-slate-500 text-sm">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <Link href="/account/orders" className="card p-5 flex items-center gap-3 hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800 group-hover:text-primary-700">Sifarişlərim</p>
                <p className="text-xs text-slate-400">Sifariş tarixçəsi</p>
              </div>
            </Link>
            <div className="card p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800">Parametrlər</p>
                <p className="text-xs text-slate-400">Hesab tənzimləmələri</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" /> Profil məlumatları
            </h2>
            <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
              <div>
                <label className="label">Ad Soyad</label>
                <input
                  {...register('name', { required: 'Tələb olunur', minLength: { value: 2, message: 'Min 2 hərf' } })}
                  className={`input ${errors.name ? 'input-error' : ''}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">E-poçt</label>
                <input value={user?.email || ''} disabled className="input bg-slate-50 text-slate-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="label">Telefon</label>
                <input {...register('phone')} className="input" placeholder="+994 50 123 45 67" />
              </div>
              <div>
                <label className="label">Ünvan</label>
                <textarea {...register('address')} className="input resize-none" rows={2} placeholder="Şəhər, rayon, küçə..." />
              </div>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary">
                {mutation.isPending
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Yadda saxlanılır...</>
                  : <><Save className="w-4 h-4" /> Yadda saxla</>
                }
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
