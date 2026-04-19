'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Package, ShoppingBag, Tag, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, ORDER_STATUS_LABELS } from '@/lib/utils';
import Link from 'next/link';

// Safe date format — avoids hydration mismatch
function safeDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat('az-AZ', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr));
  } catch { return ''; }
}

function StatCard({ icon: Icon, label, value, color, href }) {
  const content = (
    <div className={`card p-5 flex items-center gap-4 hover:shadow-md transition-shadow ${href ? 'cursor-pointer' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-slate-900">{value ?? '—'}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data.data),
    refetchInterval: 30_000,
    enabled: mounted,
  });

  if (!mounted || isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl animate-pulse bg-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-80 rounded-2xl animate-pulse bg-slate-200" />
          <div className="skeleton h-80 rounded-2xl animate-pulse bg-slate-200" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const lowStock = data?.lowStockProducts || [];
  const ordersByStatus = data?.ordersByStatus || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Göstərici paneli</h1>
        <p className="text-slate-500 text-sm mt-1">Mağazanızın ümumi vəziyyəti</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={TrendingUp} label="Ümumi gəlir"    value={formatPrice(stats.totalRevenue || 0)} color="bg-green-100 text-green-600" />
        <StatCard icon={ShoppingBag} label="Sifarişlər"    value={stats.totalOrders}    color="bg-blue-100 text-blue-600"    href="/admin/orders" />
        <StatCard icon={Package}     label="Məhsullar"     value={stats.totalProducts}  color="bg-purple-100 text-purple-600" href="/admin/products" />
        <StatCard icon={Users}       label="Müştərilər"    value={stats.totalUsers}     color="bg-accent-100 text-accent-600" href="/admin/users" />
        <StatCard icon={Tag}         label="Kateqoriyalar" value={stats.totalCategories} color="bg-indigo-100 text-indigo-600" href="/admin/categories" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-lg">Son sifarişlər</h2>
            <Link href="/admin/orders" className="text-sm text-primary-600 hover:underline font-medium">
              Hamısına bax →
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 && <p className="text-slate-400 text-sm">Sifariş yoxdur</p>}
            {recentOrders.map(order => {
              const s = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-700' };
              const orderId = order.id || '';
              const createdAt = order.created_at || order.createdAt;
              const userName = order.user?.name || order.user_name || '—';
              const totalPrice = order.total_price || order.totalPrice;
              return (
                <Link
                  key={orderId}
                  href={`/admin/orders/${orderId}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">
                      {userName} · <span className="font-mono text-xs">#{orderId.slice(0, 8).toUpperCase()}</span>
                    </p>
                    <p className="text-xs text-slate-400">{safeDate(createdAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-sm text-slate-800">{formatPrice(totalPrice)}</p>
                    <span className={`badge text-xs ${s.color}`}>{s.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Order statuses */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg mb-4">Sifariş statusları</h2>
            <div className="space-y-2">
              {ordersByStatus.length === 0 && <p className="text-slate-400 text-sm">Məlumat yoxdur</p>}
              {ordersByStatus.map(({ status, _count }) => {
                const s = ORDER_STATUS_LABELS[status] || { label: status, color: 'bg-slate-100 text-slate-700' };
                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className={`badge ${s.color}`}>{s.label}</span>
                    <span className="font-bold text-slate-700">{_count?.status ?? _count?.count ?? 0}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Low stock */}
          {lowStock.length > 0 && (
            <div className="card p-6 border-l-4 border-amber-400">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="font-display font-semibold text-lg">Az stok</h2>
              </div>
              <div className="space-y-2">
                {lowStock.slice(0, 5).map(product => (
                  <Link
                    key={product.id}
                    href={`/admin/products/${product.id}/edit`}
                    className="flex items-center justify-between text-sm hover:bg-slate-50 rounded-lg px-2 py-1 transition-colors"
                  >
                    <span className="text-slate-700 truncate">{product.nameAz || product.name_az}</span>
                    <span className={`font-bold ml-2 flex-shrink-0 ${product.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {product.stock} ədəd
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
