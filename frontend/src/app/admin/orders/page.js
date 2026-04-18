'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Filter } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, formatDate, ORDER_STATUS_LABELS, getErrorMessage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const ALL_STATUSES = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', { status, page }],
    queryFn: () => api.get('/orders/admin/all', { params: { page, limit: 20, status: status || undefined } }).then(r => r.data),
    placeholderData: prev => prev,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, newStatus }) => api.patch(`/orders/admin/${id}/status`, { status: newStatus }),
    onSuccess: () => { toast.success('Status yeniləndi'); qc.invalidateQueries(['admin-orders']); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const orders = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Sifarişlər</h1>
          <p className="text-slate-500 text-sm mt-1">{pagination?.total || 0} sifariş</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => { setStatus(''); setPage(1); }}
          className={cn('badge text-sm py-1.5 px-3.5 cursor-pointer transition-all', !status ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
          Hamısı
        </button>
        {ALL_STATUSES.map(s => {
          const meta = ORDER_STATUS_LABELS[s];
          return (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={cn('badge text-sm py-1.5 px-3.5 cursor-pointer transition-all',
                status === s ? 'bg-primary-600 text-white' : `${meta.color} hover:opacity-80`
              )}>
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Sifariş №', 'Müştəri', 'Məhsullar', 'Cəmi', 'Tarix', 'Status', 'Əməliyyat'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-12 rounded-lg" /></td></tr>
                ))
                : orders.map(order => {
                  const s = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-700' };
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-slate-700">#{order.id.slice(0, 8).toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm text-slate-800">{order.customerName}</p>
                        <p className="text-xs text-slate-400">{order.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{order.orderItems.length} məhsul</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{formatPrice(order.totalPrice)}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${s.color}`}>{s.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            onChange={e => statusMutation.mutate({ id: order.id, newStatus: e.target.value })}
                            className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium pr-7 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            {ALL_STATUSES.map(s => (
                              <option key={s} value={s}>{ORDER_STATUS_LABELS[s]?.label || s}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>

        {orders.length === 0 && !isLoading && (
          <div className="py-16 text-center text-slate-400">
            <p className="text-4xl mb-3">📦</p>
            <p>Sifariş tapılmadı</p>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-slate-100">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn btn-secondary btn-sm">← Əvvəlki</button>
            <span className="btn btn-sm bg-slate-100 border-0 text-slate-600 cursor-default">{page} / {pagination.totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages} className="btn btn-secondary btn-sm">Növbəti →</button>
          </div>
        )}
      </div>
    </div>
  );
}
