import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/shop/CartDrawer';
import ProductGrid from '@/components/shop/ProductGrid';

export const metadata = {
  title: 'Bütün Məhsullar | Məktəb Ləvazimatları',
  description: 'Məktəb çantaları, dəftərlər, qələmlər və daha çox.',
};

export default function ProductsPage() {
  return (
    <>
      <Header />
      <CartDrawer />
      <main className="page-container py-10">
        <div className="mb-8">
          <h1 className="section-title">Məhsullar</h1>
          <p className="text-slate-500 mt-2">Bütün məktəb ləvazimatları bir yerdə</p>
        </div>
        <Suspense fallback={<div className="text-center py-10 text-slate-500">Yüklənir...</div>}>
          <ProductGrid />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
