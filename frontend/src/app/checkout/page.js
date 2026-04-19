'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { ShoppingBag, CheckCircle, ArrowLeft, MapPin, Phone, User, Train, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { formatPrice, getImageUrl, getErrorMessage } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/shop/CartDrawer';

// Bakı metro stansiyaları — tam siyahı
const BAKU_METROS = [
  // Xətai xətti (qırmızı)
  { line: '🔴 İçərişəhər–Hövsan', stations: [
    'İçərişəhər', 'Sahil', '28 May', 'Gənclik', 'Nəriman Nərimanov',
    'Bakmil', 'Ulduz', 'Koroğlu', 'Qara Qarayev', 'Neftçilər',
    'Xalqlar Dostluğu', 'Əhmədli', 'Həzi Aslanov', 'Hövsan',
  ]},
  // Elmlər xətti (yaşıl)
  { line: '🟢 8 Noyabr–Dərnəgül', stations: [
    '8 Noyabr', 'Avtovağzal', 'Memar Əcəmi', '20 Yanvar',
    'İnşaatçılar', 'Elmlər Akademiyası', 'İstiqlaliyyət',
    'Cəfər Cabbarlı', 'Nizami', 'Əhmədli',
  ]},
  // Cəfər Cabbarlı qovşağı
  { line: '🔵 Digər', stations: [
    'Dərnəgül', 'Azadlıq Prospekti', 'Nəsimi', 'Həzi Aslanov (Cənub)',
  ]},
];

const ALL_STATIONS = BAKU_METROS.flatMap(g => g.stations.map(s => ({ station: s, line: g.line })));

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { serverCart, fetchCart } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deliveryType, setDeliveryType] = useState('address'); // 'address' | 'metro'

  const { register, handleSubmit, formState: { errors }, setValue, watch, control } = useForm();
  const selectedMetro = watch('metroStation');

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) { router.push('/login'); return; }
    fetchCart();
  }, []);

  useEffect(() => {
    if (user) {
      setValue('customerName', user.name || '');
      setValue('customerPhone', user.phone || '');
      if (deliveryType === 'address') {
        setValue('address', user.address || '');
      }
    }
  }, [user, deliveryType]);

  // When metro selected → auto-fill address
  useEffect(() => {
    if (deliveryType === 'metro' && selectedMetro) {
      setValue('address', `Metro stansiyası: ${selectedMetro}`);
    }
  }, [selectedMetro, deliveryType]);

  const items = serverCart?.items || [];
  const total = parseFloat(serverCart?.total || 0);

  const onSubmit = async (data) => {
    if (!items.length) { toast.error('Səbətiniz boşdur'); return; }
    setSubmitting(true);
    try {
      const payload = {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        address: deliveryType === 'metro'
          ? `Metro stansiyası: ${data.metroStation}${data.metroNote ? ' — ' + data.metroNote : ''}`
          : data.address,
        notes: data.notes || undefined,
      };
      await api.post('/orders', payload);
      setSuccess(true);
      await fetchCart();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <>
        <Header /><CartDrawer />
        <main className="page-container py-10">
          <div className="skeleton h-96 rounded-2xl animate-pulse bg-slate-200" />
        </main>
        <Footer />
      </>
    );
  }

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
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-8">Sifarişi tamamla</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Personal info */}
              <div className="card p-6">
                <h2 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-600" /> Şəxsi məlumatlar
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Ad Soyad</label>
                    <input
                      {...register('customerName', { required: 'Ad tələb olunur' })}
                      className={`input ${errors.customerName ? 'input-error' : ''}`}
                      placeholder="Aynur Həsənova"
                    />
                    {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>}
                  </div>
                  <div>
                    <label className="label">Telefon</label>
                    <input
                      {...register('customerPhone', { required: 'Telefon tələb olunur' })}
                      className={`input ${errors.customerPhone ? 'input-error' : ''}`}
                      placeholder="+994 50 123 45 67"
                    />
                    {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone.message}</p>}
                  </div>
                </div>
              </div>

              {/* Delivery type toggle */}
              <div className="card p-6">
                <h2 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" /> Çatdırılma üsulu
                </h2>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('address')}
                    className={`flex items-center gap-2.5 p-4 rounded-xl border-2 transition-all text-left ${
                      deliveryType === 'address'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <MapPin className={`w-5 h-5 ${deliveryType === 'address' ? 'text-primary-600' : 'text-slate-400'}`} />
                    <div>
                      <p className={`font-medium text-sm ${deliveryType === 'address' ? 'text-primary-700' : 'text-slate-700'}`}>
                        Ünvana çatdırılma
                      </p>
                      <p className="text-xs text-slate-400">Ev, ofis və s.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('metro')}
                    className={`flex items-center gap-2.5 p-4 rounded-xl border-2 transition-all text-left ${
                      deliveryType === 'metro'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Train className={`w-5 h-5 ${deliveryType === 'metro' ? 'text-primary-600' : 'text-slate-400'}`} />
                    <div>
                      <p className={`font-medium text-sm ${deliveryType === 'metro' ? 'text-primary-700' : 'text-slate-700'}`}>
                        Metro stansiyası
                      </p>
                      <p className="text-xs text-slate-400">Bakı metrosu</p>
                    </div>
                  </button>
                </div>

                {/* Address input */}
                {deliveryType === 'address' && (
                  <div className="space-y-3">
                    <div>
                      <label className="label">Ünvan</label>
                      <textarea
                        {...register('address', { required: 'Ünvan tələb olunur' })}
                        className={`input resize-none ${errors.address ? 'input-error' : ''}`}
                        rows={3}
                        placeholder="Şəhər, rayon, küçə, ev nömrəsi"
                      />
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                    </div>
                  </div>
                )}

                {/* Metro selector */}
                {deliveryType === 'metro' && (
                  <div className="space-y-3">
                    <div>
                      <label className="label">Metro stansiyası seçin</label>
                      <div className="relative">
                        <select
                          {...register('metroStation', { required: deliveryType === 'metro' ? 'Metro stansiyası seçin' : false })}
                          className={`input appearance-none pr-10 ${errors.metroStation ? 'input-error' : ''}`}
                        >
                          <option value="">— Stansiya seçin —</option>
                          {BAKU_METROS.map(group => (
                            <optgroup key={group.line} label={group.line}>
                              {group.stations.map(station => (
                                <option key={station} value={station}>{station}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                      {errors.metroStation && <p className="text-red-500 text-xs mt-1">{errors.metroStation.message}</p>}
                    </div>

                    {selectedMetro && (
                      <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-xl text-sm text-primary-700">
                        <Train className="w-4 h-4 flex-shrink-0" />
                        <span><strong>{selectedMetro}</strong> stansiyasında çatdırılacaq</span>
                      </div>
                    )}

                    <div>
                      <label className="label">Əlavə məlumat (isteğe bağlı)</label>
                      <input
                        {...register('metroNote')}
                        className="input"
                        placeholder="Məs: çıxış 2, saat 14:00"
                      />
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="mt-4">
                  <label className="label">Qeyd (isteğe bağlı)</label>
                  <textarea
                    {...register('notes')}
                    className="input resize-none"
                    rows={2}
                    placeholder="Sürücü üçün əlavə məlumat..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !items.length}
                className="btn btn-primary btn-lg w-full"
              >
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
                {items.map(item => {
                  const imgUrl = getImageUrl(item.product?.image);
                  return (
                    <li key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        {imgUrl ? (
                          <Image src={imgUrl} alt={item.product?.nameAz || ''} width={56} height={56}
                            className="w-full h-full object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 line-clamp-1">
                          {item.product?.nameAz || item.product?.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.quantity} ədəd × {formatPrice(item.product?.price)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-800 flex-shrink-0">
                        {formatPrice(parseFloat(item.product?.price || 0) * item.quantity)}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <hr className="border-slate-100 mb-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Ara cəm:</span><span>{formatPrice(total)}</span>
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

              {deliveryType === 'metro' && selectedMetro && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-center gap-2 text-sm text-blue-700">
                  <Train className="w-4 h-4 flex-shrink-0" />
                  <span><strong>{selectedMetro}</strong> metrosuna çatdırılır</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
