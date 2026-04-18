'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ShoppingBag, CheckCircle, ArrowLeft, MapPin, Phone, User } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { formatPrice, getImageUrl, getErrorMessage } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/shop/CartDrawer';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { serverCart, fetchCart } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    fetchCart();
  }, []);

  useEffect(() => {
    if (user) {
      setValue('customerName', user.name || '');
      setValue('customerPhone', user.phone || '');
      setValue('address', user.address || '');
    }
  }, [user]);

  const items = serverCart?.items || [];
  const total = parseFloat(serverCart?.total || 0);

  const onSubmit = async (data) => {
    if (!items.length) { toast.error('Səbətiniz boşdur'); return; }
    setSubmitting(true);
    try {
      await api.post('/orders', data);
      setSuccess(true);
      await fetchCart();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <>
        <Header /><CartDrawer />
        <main className="page-container py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">Sifariş qəbul edildi!</h1>
            <p className="text-slate-500 mb-8">Sifarişiniz uğurla verildi. Tezliklə əlaqə saxlayacağıq.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/account/orders" className="btn btn-primary">Sifarişlərimə bax</Link>
              <Link href="/" className="btn btn-secondary">Ana səhifə</Link>
            </div>
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
        <Link href="/products" className="btn btn-ghost mb-6">
          <ArrowLeft className="w-4 h-4" /> Geri
        </Link>
        <h1 className="section-title mb-8">Sifarişi tamamla</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="card p-6">
                <h2 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-600" /> Şəxsi məlumatlar
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Ad Soyad</label>
                    <input {...register('customerName', { required: 'Ad tələb olunur' })}
                      className={`input ${errors.customerName ? 'input-error' : ''}`}
                      placeholder="Aynur Həsənova" />
                    {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>}
                  </div>
                  <div>
                    <label className="label">Telefon</label>
                    <input {...register('customerPhone', { required: 'Telefon tələb olunur' })}
                      className={`input ${errors.customerPhone ? 'input-error' : ''}`}
                      placeholder="+994 50 123 45 67" />
                    {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone.message}</p>}
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" /> Çatdırılma ünvanı
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Ünvan</label>
                    <textarea {...register('address', { required: 'Ünvan tələb olunur' })}
                      className={`input resize-none ${errors.address ? 'input-error' : ''}`}
                      rows={3}
                      placeholder="Şəhər, rayon, küçə, ev nömrəsi" />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                  </div>
                  <div>
                    <label className="label">Qeyd (isteğe bağlı)</label>
                    <textarea {...register('notes')}
                      className="input resize-none" rows={2}
                      placeholder="Əlavə məlumat, qapı kodu və s." />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={submitting || !items.length}
                className="btn btn-primary btn-lg w-full">
                {submitting ? (
                  <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Göndərilir...</>
                ) : (
                  <><ShoppingBag className="w-5 h-5" /> Sifarişi ver ({formatPrice(total)})</>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h2 className="font-display font-semibold text-lg mb-5">Sifariş xülasəsi</h2>
              <ul className="space-y-3 mb-5">
                {items.map(item => (
                  <li key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      {item.product?.image
                        ? <Image src={getImageUrl(item.product.image)} alt={item.product.nameAz} width={56} height={56} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 line-clamp-1">{item.product?.nameAz}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.quantity} ədəd × {formatPrice(item.product?.price)}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 flex-shrink-0">
                      {formatPrice(parseFloat(item.product?.price) * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <hr className="border-slate-100 mb-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Ara cəm:</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Çatdırılma:</span>
                  <span className="text-green-600 font-medium">{total >= 50 ? 'Pulsuz' : formatPrice(5)}</span>
                </div>
                <hr className="border-slate-100" />
                <div className="flex justify-between font-bold text-base text-slate-900">
                  <span>Cəmi:</span>
                  <span>{formatPrice(total >= 50 ? total : total + 5)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
