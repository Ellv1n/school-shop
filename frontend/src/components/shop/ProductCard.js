'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star, Package } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { formatPrice, getImageUrl, truncate, cn } from '@/lib/utils';

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuthStore();
  const { addToCartServer, addToCartLocal, setOpen } = useCartStore();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isAuthenticated()) {
      await addToCartServer(product.id, 1);
    } else {
      addToCartLocal(product, 1);
    }
    setOpen(true);
  };

  const isOutOfStock = product.stock === 0;
  const imageUrl = getImageUrl(product.image);

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div className="relative aspect-square bg-slate-50 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.nameAz || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-40">🎒</span>
            </div>
          )}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {product.featured && (
              <span className="badge bg-accent-500 text-white shadow-sm">
                <Star className="w-3 h-3 mr-1" /> Seçilmiş
              </span>
            )}
            {isOutOfStock && (
              <span className="badge bg-slate-800/80 text-white">Bitib</span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="badge bg-red-100 text-red-700">Son {product.stock} ədəd</span>
            )}
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-primary-600 font-medium mb-1 truncate">
            {product.category?.nameAz || ''}
          </p>
          <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
            {product.nameAz || product.name}
          </h3>
          {(product.descriptionAz || product.description) && (
            <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
              {truncate(product.descriptionAz || product.description, 70)}
            </p>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="font-display font-bold text-lg text-slate-900">
              {formatPrice(product.price)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
                isOutOfStock
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700 hover:scale-110 shadow-sm hover:shadow-md'
              )}
              title={isOutOfStock ? 'Stokda yoxdur' : 'Səbətə əlavə et'}
            >
              {isOutOfStock
                ? <Package className="w-4 h-4" />
                : <ShoppingCart className="w-4 h-4" />
              }
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
