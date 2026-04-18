'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Package, Star, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, getImageUrl, getErrorMessage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', { search, categorySlug, page }],
    queryFn: () => api.get('/products', {
      params: { page, limit: 15, search: search || undefined, categorySlug: categorySlug || undefined }
    }).then(r => r.data),
    placeholderData: prev => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success('Məhsul silindi');
      qc.invalidateQueries(['admin-products']);
      setDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const products   = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Məhsullar</h1>
          <p className="text-slate-500 text-sm mt-1">{pagination?.total || 0} məhsul</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary">
          <Plus className="w-4 h-4" /> Yeni məhsul
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9" placeholder="Məhsul axtar..." />
        </div>
        <select value={categorySlug} onChange={e => { setCategorySlug(e.target.value); setPage(1); }}
          className="input sm:w-48">
          <option value="">Bütün kateqoriyalar</option>
          {categories?.map(c => <option key={c.id} value={c.slug}>{c.nameAz}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Məhsul', 'Kateqoriya', 'Qiymət', 'Stok', 'Status', 'Əməliyyat'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="skeleton h-12 rounded-lg" /></td></tr>
                ))
                : products.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                          {product.image
                            ? <Image src={getImageUrl(product.image)} alt={product.nameAz} width={48} height={48} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate max-w-[200px]">{product.nameAz}</p>
                          {product.featured && <span className="badge bg-accent-50 text-accent-600 text-[10px] gap-0.5"><Star className="w-2.5 h-2.5" />Seçilmiş</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-primary-50 text-primary-700 text-xs">{product.category?.nameAz}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('font-semibold text-sm',
                        product.stock === 0 ? 'text-red-600' : product.stock <= 5 ? 'text-amber-600' : 'text-green-600'
                      )}>
                        {product.stock === 0
                          ? <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Bitib</span>
                          : `${product.stock} ədəd`
                        }
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {product.isActive ? 'Aktiv' : 'Passiv'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/admin/products/${product.id}/edit`}
                          className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => setDeleteId(product.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {products.length === 0 && !isLoading && (
          <div className="py-16 text-center text-slate-400">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Məhsul tapılmadı</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-slate-100">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn btn-secondary btn-sm">← Əvvəlki</button>
            <span className="btn btn-sm bg-slate-100 border-0 text-slate-600 cursor-default">
              {page} / {pagination.totalPages}
            </span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages} className="btn btn-secondary btn-sm">Növbəti →</button>
          </div>
        )}
      </div>

      {/* Delete confirm dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-8 max-w-sm w-full animate-slide-up">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h2 className="font-display font-bold text-xl text-center mb-2">Silmək istəyirsiniz?</h2>
            <p className="text-slate-500 text-sm text-center mb-6">Bu məhsul deaktivləşdiriləcək.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn btn-secondary flex-1">Ləğv et</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}
                className="btn btn-danger flex-1">
                {deleteMutation.isPending ? 'Silinir...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
