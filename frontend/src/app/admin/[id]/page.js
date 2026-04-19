'use client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Package, User, Phone, MapPin,
  Clock, ChevronDown, FileText
} from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, formatDate, getImageUrl, ORDER_STATUS_LABELS, getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

const ALL_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      // Use admin all orders endpoint filtered, or fetch directly
      const res = await api.get('/orders/admin/all', { params: { limit: 100 } });
      const found = res.data.data?.find(o => o.id === id);
      if (!found) throw new Error('Sifariş tapılmadı');
      return found;
    },
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus) =>
      api.patch(`/orders/admin/${id}/status`, { status: newStatus }),
    onSuccess: () => {
      toast.success('Status yeniləndi');
      qc.invalidateQueries(['admin-order', id]);
      qc.invalidateQueries(['admin-orders']);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton h-28 rounded-2xl animate-pulse bg-slate-200" />
        ))}
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">😢</p>
        <h2 className="font-display text-xl font-bold mb-4">Sifariş tapılmadı</h2>
        <Link href="/admin/orders" className="btn btn-primary">← Sifarişlərə qayıt</Link>
      </div>
    );
  }

  const status = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-700' };
  const orderItems = order.order_items || order.orderItems || [];
  const totalPrice = order.total_price || order.totalPrice;
  const createdAt = order.created_at || order.createdAt;
  const customerName = order.customer_name || order.customerName;
  const customerPhone = order.customer_phone || order.customerPhone;

  return (
    <div className="max-w-3xl space-y-5">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/admin/orders')} className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Sifariş <span className="font-mono text-primary-600">#{(order.id || '').slice(0, 8).toUpperCase()}</span>
          </h1>
          {createdAt && (
            <p className="text-slate-400 text-sm flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5" /> {formatDate(createdAt)}
            </p>
          )}
        </div>
      </div>

      {/* Status + Update */}
      <div className="card p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">Cari status:</span>
          <span className={`badge text-sm py-1.5 px-3.5 ${status.color}`}>{status.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Statusu dəyiş:</span>
          <div className="relative">
            <select
              value={order.status}
              onChange={e => statusMutation.mutate(e.target.value)}
              disabled={statusMutation.isPending}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium pr-9 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
            >
              {ALL_STATUSES.map(s => (
                <option key={s} value={s}>{ORDER_STATUS_LABELS[s]?.label || s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Customer info */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-600" /> Müştəri məlumatları
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Ad Soyad</p>
              <p className="font-semibold text-slate-800">{customerName}</p>
              {order.user?.email && (
                <p className="text-xs text-slate-500 mt-0.5">{order.user.email}</p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Telefon</p>
              <p className="font-semibold text-slate-800">{customerPhone}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Ünvan</p>
              <p className="font-semibold text-slate-800">{order.address}</p>
            </div>
          </div>
        </div>

        {order.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2">
            <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Qeyd</p>
              <p className="text-sm text-slate-700">{order.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Order items */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary-600" /> Məhsullar ({orderItems.length})
        </h2>

        {orderItems.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">Məhsul məlumatı yoxdur</p>
        ) : (
          <ul className="space-y-4">
            {orderItems.map((item, idx) => {
              const product = item.product || {};
              const imgUrl = getImageUrl(product.image);
              const name = product.nameAz || product.name || 'Məhsul';
              const price = item.price || product.price || 0;
              const qty = item.quantity || 1;

              return (
                <li key={item.id || idx} className="flex gap-4 items-center p-3 rounded-xl hover:bg-slate-50 transition-colors">
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
                    {product.id && (
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        ID: {product.id.slice(0, 8)}...
                      </p>
                    )}
                    <p className="text-sm text-slate-500 mt-0.5">
                      {qty} ədəd × {formatPrice(price)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-slate-800">{formatPrice(parseFloat(price) * qty)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Total */}
        <div className="border-t border-slate-100 mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Məhsullar ({orderItems.length} növ):</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-slate-900">
            <span>Ümumi məbləğ:</span>
            <span className="text-primary-700">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex gap-3">
        <Link href="/admin/orders" className="btn btn-secondary flex-1 sm:flex-none">
          ← Sifarişlər siyahısı
        </Link>
      </div>
    </div>
  );
}
