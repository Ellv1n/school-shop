'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingCart, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { formatPrice, getImageUrl, cn } from '@/lib/utils';

export default function CartDrawer() {
  const {
    isOpen, setOpen, serverCart, items,
    removeFromCartServer, removeFromCartLocal,
    updateCartItemServer, updateQuantityLocal,
    getItemCount, getTotal,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const authenticated = isAuthenticated();

  const cartItems = authenticated
    ? (serverCart?.items || [])
    : items.map(i => ({
        id: i.productId,
        product: i.product,
        quantity: i.quantity,
        productId: i.productId,
      }));

  const total = getTotal(authenticated);
  const count = getItemCount(authenticated);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleRemove = (item) => {
    if (authenticated) removeFromCartServer(item.id);
    else removeFromCartLocal(item.productId);
  };

  const handleUpdateQty = (item, delta) => {
    const newQty = item.quantity + delta;
    if (authenticated) updateCartItemServer(item.id, newQty);
    else updateQuantityLocal(item.productId, newQty);
  };

  const imgSrc = (item) => {
    const path = item?.product?.image;
    return getImageUrl(path);
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setOpen(false)}
      />
      <div className={cn(
        'fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-primary-600" />
            <h2 className="font-display font-semibold text-lg">Səbətim</h2>
            {count > 0 && (
              <span className="badge bg-primary-100 text-primary-700">{count} məhsul</span>
            )}
          </div>
          <button onClick={() => setOpen(false)} className="btn btn-ghost btn-sm rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
              <ShoppingBag className="w-16 h-16 opacity-30" />
              <div className="text-center">
                <p className="font-medium text-slate-600">Səbətiniz boşdur</p>
                <p className="text-sm mt-1">Məhsul əlavə etmək üçün mağazaya baxın</p>
              </div>
              <Link href="/products" onClick={() => setOpen(false)} className="btn btn-primary mt-2">
                Alış-verişə başla
              </Link>
            </div>
          ) : (
            <ul className="space-y-1 px-4">
              {cartItems.map(item => (
                <li key={item.id} className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    {imgSrc(item) ? (
                      <Image
                        src={imgSrc(item)}
                        alt={item.product?.nameAz || ''}
                        width={64} height={64}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">
                      {item.product?.nameAz || item.product?.name}
                    </p>
                    <p className="text-sm text-primary-600 font-semibold mt-0.5">
                      {formatPrice(item.product?.price)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateQty(item, -1)}
                          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(item, 1)}
                          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">
                          {formatPrice(parseFloat(item.product?.price || 0) * item.quantity)}
                        </span>
                        <button
                          onClick={() => handleRemove(item)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4 space-y-3 bg-slate-50">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Cəmi:</span>
              <span className="font-display font-bold text-xl text-slate-900">{formatPrice(total)}</span>
            </div>
            <Link href="/checkout" onClick={() => setOpen(false)} className="btn btn-primary w-full btn-lg">
              <ShoppingBag className="w-5 h-5" /> Sifarişi tamamla
            </Link>
            <button onClick={() => setOpen(false)} className="btn btn-secondary w-full">
              Alış-verişə davam et
            </button>
          </div>
        )}
      </div>
    </>
  );
}
