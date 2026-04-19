'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package, MapPin, Phone, User, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { formatPrice, formatDate, getImageUrl, ORDER_STATUS_LABELS } from '@/lib/utils';
import api from '@/lib/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/shop/CartDrawer';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login');
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/my-orders/${id}`).then(r => r.data.data),
    enabled: !!id && isAuthenticated(),
  });

  if (isLoading) {
    return (
      <>
        <Header /><CartDrawer />
        <main className="page-container py-10">
          <div className="max-w-2xl mx-auto space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="skeleton h-24 rounded-2xl animate-pulse bg-slate-200" />
            ))}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Header /><CartDrawer />
        <main className="page-container py-20 text-center">
          <p className="text-5xl mb-4">😢</p>
          <h2 className="font-display text-2xl font-bold mb-4">Sifariş tapılmadı</h2>
          <Link href="/account/orders" className="btn btn-primary">← Sifarişlərə qayıt</Link>
        </main>
        <Footer />
      </>
    );
  }

  const status = ORDER_STATUS_LABELS[data.status] || { label: data.status, color: 'bg-slate-100 text-slate-700' };
  const orderItems = data.order_items || data.orderItems || [];

  return (
    <>
      <Header /><CartDrawer />
      <main className="page-container py-10">
        <div className="max-w-2xl mx-auto">
          <Link href="/account/orders" className="btn btn-ghost mb-6 inline-flex">
            <ArrowLeft className="w-4 h-4" /> Sifarişlərə qayıt
          </Link>

          {/* Header */}
          <div className="card p-6 mb-4">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div>
                <h1 className="font-display text-xl font-bold text-slate-900">
                  Sifariş <span className="font-mono">#{(data.id || '').slice(0, 8).toUpperCase()}</span>
                </h1>
                <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {data.created_at || data.createdAt ? formatDate(data.created_at || data.createdAt) : ''}
                </p>
              </div>
              <span className={`badge text-sm py-1.5 px-3.5 ${status.color}`}>{status.label}</span>
            </div>

            {/* Customer info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-start gap-2 text-sm">
                <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Ad Soyad</p>
                  <p className="font-medium text-slate-800">{data.customer_name || data.customerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Telefon</p>
                  <p className="font-medium text-slate-800">{data.customer_phone || data.customerPhone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Ünvan</p>
                  <p className="font-medium text-slate-800">{data.address}</p>
                </div>
              </div>
            </div>

            {(data.notes) && (
              <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-600">
                <span className="font-medium">Qeyd: </span>{data.notes}
              </div>
            )}
          </div>

          {/* Order items */}
          <div className="card p-6 mb-4">
            <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" /> Məhsullar
            </h2>
            <ul className="space-y-4">
              {orderItems.map((item, idx) => {
                const product = item.product || {};
                const imgUrl = getImageUrl(product.image);
                const name = product.nameAz || product.name || 'Məhsul';
                const price = item.price || product.price || 0;
                const qty = item.quantity || 1;
                return (
                  <li key={item.id || idx} className="flex gap-4 items-center">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={name}
                          width={56} height={56}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{name}</p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {qty} ədəd × {formatPrice(price)}
                      </p>
                    </div>
                    <span className="font-bold text-slate-800 flex-shrink-0">
                      {formatPrice(parseFloat(price) * qty)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between items-center">
              <span className="text-slate-600 font-medium">Cəmi:</span>
              <span className="font-display font-bold text-xl text-primary-700">
                {formatPrice(data.total_price || data.totalPrice)}
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
