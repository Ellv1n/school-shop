'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart, ArrowLeft, Package, Star, Minus, Plus,
  CheckCircle, AlertTriangle, Tag
} from 'lucide-react';
import api from '@/lib/api';
import { getImageUrl, formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/shop/CartDrawer';
import { cn } from '@/lib/utils';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [qty, setQty] = useState(1);
  const { isAuthenticated } = useAuthStore();
  const { addToCartServer, addToCartLocal, setOpen } = useCartStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then(r => r.data.data),
  });

  const handleAddToCart = async () => {
    if (isAuthenticated()) await addToCartServer(data.id, qty);
    else addToCartLocal(data, qty);
    setOpen(true);
  };

  if (isLoading) {
    return (
      <>
        <Header /><CartDrawer />
        <div className="page-container py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="space-y-4">
              {[80, 40, 60, 30, 100, 50].map(w => (
                <div key={w} className={`skeleton h-5 rounded w-${w}`} style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Header /><CartDrawer />
        <div className="page-container py-20 text-center">
          <p className="text-5xl mb-4">😢</p>
          <h2 className="section-title mb-2">Məhsul tapılmadı</h2>
          <Link href="/products" className="btn btn-primary mt-4">← Geri qayıt</Link>
        </div>
        <Footer />
      </>
    );
  }

  const inStock = data.stock > 0;

  return (
    <>
      <Header />
      <CartDrawer />
      <main className="page-container py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-800">Ana səhifə</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-slate-800">Məhsullar</Link>
          <span>/</span>
          <Link href={`/products?category=${data.category?.slug}`} className="hover:text-slate-800">
            {data.category?.nameAz}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-[200px]">{data.nameAz}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-100">
              {data.image ? (
                <Image
                  src={getImageUrl(data.image)} alt={data.nameAz}
                  fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl opacity-20">🎒</div>
              )}
            </div>
            {data.featured && (
              <div className="absolute top-4 left-4">
                <span className="badge bg-accent-500 text-white shadow-md">
                  <Star className="w-3 h-3 mr-1" fill="currentColor" /> Seçilmiş
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <Link href={`/products?category=${data.category?.slug}`}
              className="inline-flex items-center gap-1.5 text-primary-600 text-sm font-medium mb-3 hover:underline w-fit"
            >
              <Tag className="w-4 h-4" /> {data.category?.nameAz}
            </Link>

            <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">{data.nameAz}</h1>
            {data.name !== data.nameAz && (
              <p className="text-slate-400 text-sm mb-4">{data.name}</p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 my-4">
              <span className="font-display text-4xl font-bold text-primary-700">
                {formatPrice(data.price)}
              </span>
            </div>

            {/* Stock */}
            <div className={cn('flex items-center gap-2 mb-6 text-sm font-medium',
              inStock ? 'text-green-600' : 'text-red-500'
            )}>
              {inStock
                ? <><CheckCircle className="w-4 h-4" /> Stokda var ({data.stock} ədəd)</>
                : <><AlertTriangle className="w-4 h-4" /> Stokda yoxdur</>
              }
            </div>

            {/* Description */}
            {data.descriptionAz && (
              <div className="prose prose-sm text-slate-600 mb-8">
                <p className="leading-relaxed">{data.descriptionAz}</p>
              </div>
            )}

            {/* Quantity + Cart */}
            {inStock && (
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-lg">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(data.stock, q + 1))}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button onClick={handleAddToCart} className="btn btn-primary btn-lg flex-1 sm:flex-none">
                  <ShoppingCart className="w-5 h-5" />
                  Səbətə əlavə et
                </button>
              </div>
            )}

            {/* Subtotal */}
            {qty > 1 && (
              <p className="text-sm text-slate-500 mb-6">
                Cəmi: <span className="font-bold text-slate-800">{formatPrice(parseFloat(data.price) * qty)}</span>
              </p>
            )}

            {/* Meta */}
            <div className="border-t border-slate-100 pt-6 space-y-3 text-sm text-slate-500">
              <div className="flex gap-2"><span className="font-medium text-slate-700 w-28">Kateqoriya:</span><span>{data.category?.nameAz}</span></div>
              <div className="flex gap-2"><span className="font-medium text-slate-700 w-28">Stok:</span><span>{data.stock} ədəd</span></div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/products" className="btn btn-ghost">
            <ArrowLeft className="w-4 h-4" /> Geri
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
