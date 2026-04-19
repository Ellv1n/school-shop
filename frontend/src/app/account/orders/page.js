'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils';
import api from '@/lib/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/shop/CartDrawer';

export default function MyOrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) router.push('/login');
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/my-orders').then(r => r.data),
    enabled: mounted && isAuthenticated(),
  });

  const orders = data?.data || [];

  // Avoid hydration mismatch — render nothing on server
  if (!mounted) {
    return (
      <>
        <Header /><CartDrawer />
        <main className="page-container py-10">
          <div className="max-w-3xl mx-auto space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="skeleton h-24 rounded-2xl animate-pulse bg-slate-200" />
            ))}
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
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-8">Sifarişlərim</h1>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton h-28 rounded-2xl animate-pulse bg-slate-200" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="card p-16 text-center">
              <ShoppingBag className="w-14 h-14 text-slate-300 mx-auto mb-4" />
              <h2 className="font-display font-semibold text-xl text-slate-700 mb-2">Sifariş yoxdur</h2>
              <p className="text-slate-400 mb-6">Hələ heç bir sifariş verməmisiniz.</p>
              <Link href="/products" className="btn btn-primary">Alış-verişə başla</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const s = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-700' };
                const orderId = order.id || '';
                const orderItems = order.order_items || order.orderItems || [];
                const totalPrice = order.total_price || order.totalPrice;
                const createdAt = order.created_at || order.createdAt;
                return (
                  <Link
                    key={orderId}
                    href={`/account/orders/${orderId}`}
                    className="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <span className="font-semibold text-slate-800 font-mono text-sm">
                          #{orderId.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={`badge ${s.color}`}>{s.label}</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {createdAt ? formatDate(createdAt) : ''}
                      </p>
                      <p className="text-sm text-slate-600 mt-1.5">
                        {orderItems.length} məhsul · <span className="font-semibold text-slate-800">{formatPrice(totalPrice)}</span>
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0 mt-0.5" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
