'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from './ProductCard';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Ən yenilər' },
  { value: 'price-asc',      label: 'Qiymət: Aşağıdan yuxarı' },
  { value: 'price-desc',     label: 'Qiymət: Yuxarıdan aşağı' },
  { value: 'name-asc',       label: 'Ad: A-Z' },
];

function ProductSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="flex justify-between items-center mt-3">
          <div className="skeleton h-6 w-1/3 rounded" />
          <div className="skeleton w-9 h-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [sortBy, setSortBy] = useState('createdAt-desc');
  const [categorySlug, setCategorySlug] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Sync URL params
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const q   = searchParams.get('search') || '';
    setCategorySlug(cat);
    setSearch(q);
    setDebouncedSearch(q);
    setPage(1);
  }, [searchParams]);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
  });

  const [sortField, sortOrder] = sortBy.split('-');
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', { page, debouncedSearch, categorySlug, sortField, sortOrder }],
    queryFn: () =>
      api.get('/products', {
        params: {
          page, limit: 12,
          search: debouncedSearch || undefined,
          categorySlug: categorySlug || undefined,
          sortBy: sortField,
          sortOrder,
        },
      }).then(r => r.data),
    placeholderData: prev => prev,
  });

  const products    = data?.data || [];
  const pagination  = data?.pagination;

  const updateCategory = (slug) => {
    setCategorySlug(slug);
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (slug) params.set('category', slug);
    else params.delete('category');
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch(''); setDebouncedSearch(''); setCategorySlug(''); setPage(1);
    router.push(pathname);
  };

  const hasFilters = debouncedSearch || categorySlug;

  return (
    <div>
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Məhsul axtar..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input pl-10 pr-10"
          />
          {search && (
            <button onClick={() => { setSearch(''); setDebouncedSearch(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="input pr-8 appearance-none cursor-pointer min-w-[200px]"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => updateCategory('')}
          className={cn('badge text-sm py-1.5 px-3.5 cursor-pointer transition-all',
            !categorySlug ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          Hamısı
        </button>
        {categoriesData?.map(cat => (
          <button
            key={cat.id}
            onClick={() => updateCategory(cat.slug)}
            className={cn('badge text-sm py-1.5 px-3.5 cursor-pointer transition-all gap-1',
              categorySlug === cat.slug ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {cat.icon} {cat.nameAz}
          </button>
        ))}
        {hasFilters && (
          <button onClick={clearFilters} className="badge text-sm py-1.5 px-3.5 bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer gap-1">
            <X className="w-3 h-3" /> Təmizlə
          </button>
        )}
      </div>

      {/* Results count */}
      {pagination && (
        <p className="text-sm text-slate-500 mb-4">
          {pagination.total} məhsul tapıldı
          {debouncedSearch && <span className="font-medium text-slate-700"> &ldquo;{debouncedSearch}&rdquo; üçün</span>}
        </p>
      )}

      {/* Grid */}
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 transition-opacity', isFetching && 'opacity-60')}>
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)
          : products.length === 0
            ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                <span className="text-5xl">🔍</span>
                <p className="font-medium text-slate-600">Məhsul tapılmadı</p>
                <p className="text-sm">Axtarış parametrlərini dəyişin</p>
                <button onClick={clearFilters} className="btn btn-secondary mt-2">Filtrləri sıfırla</button>
              </div>
            )
            : products.map(p => <ProductCard key={p.id} product={p} />)
        }
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn btn-secondary btn-sm">
            ← Əvvəlki
          </button>
          {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
            const p = i + 1;
            return (
              <button key={p} onClick={() => setPage(p)}
                className={cn('w-9 h-9 rounded-xl text-sm font-medium transition-all',
                  page === p ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50'
                )}
              >{p}</button>
            );
          })}
          <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages} className="btn btn-secondary btn-sm">
            Növbəti →
          </button>
        </div>
      )}
    </div>
  );
}
