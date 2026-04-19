import Link from 'next/link';
import { ArrowRight, Star, Shield, Truck, HeadphonesIcon } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/shop/CartDrawer';
import FeaturedProducts from '@/components/shop/FeaturedProducts';
import CategoryGrid from '@/components/shop/CategoryGrid';

export default function HomePage() {
  return (
    <>
      <Header />
      <CartDrawer />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-400 rounded-full blur-3xl" />
          </div>
          <div className="relative page-container py-20 lg:py-28">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-white/20">
                <Star className="w-4 h-4 text-accent-300" />
                Bakının #1 məktəb mağazası
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Yeni dərs ili üçün{' '}
                <span className="text-accent-300">hər şey</span>{' '}
                burada!
              </h1>
              <p className="text-primary-100 text-lg leading-relaxed mb-8 max-w-xl">
                Çantalar, dəftərlər, qələmlər və daha çox. Keyfiyyətli məktəb ləvazimatları ən sərfəli qiymətlərlə.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/products" className="btn btn-accent btn-lg shadow-lg hover:shadow-xl">
                  Alış-verişə başla <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/products?category=backpacks" className="btn btn-lg bg-white/10 text-white border border-white/30 hover:bg-white/20">
                  Çantaları gör
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" className="w-full fill-slate-50">
              <path d="M0,32L80,37.3C160,43,320,53,480,53.3C640,53,800,43,960,37.3C1120,32,1280,32,1360,32L1440,32L1440,60L1360,60C1280,60,1120,60,960,60C800,60,640,60,480,60C320,60,160,60,80,60L0,60Z" />
            </svg>
          </div>
        </section>

        {/* Trust badges */}
        <section className="bg-slate-50 border-b border-slate-100">
          <div className="page-container py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Truck,          text: 'Pulsuz çatdırılma',  sub: '50 ₼-dən yuxarı' },
                { icon: Shield,         text: 'Keyfiyyət zəmanəti', sub: '30 günlük qaytarma' },
                { icon: Star,           text: 'Orijinal məhsullar', sub: 'Rəsmi distribütor' },
                { icon: HeadphonesIcon, text: '7/24 dəstək',        sub: 'Online & telefon' },
              ].map(({ icon: Icon, text, sub }) => (
                <div key={text} className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{text}</p>
                    <p className="text-xs text-slate-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="page-container py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-primary-600 font-medium text-sm mb-1">Kateqoriyalar</p>
              <h2 className="section-title">Nə axtarırsınız?</h2>
            </div>
            <Link href="/products" className="btn btn-secondary btn-sm hidden sm:flex">
              Hamısını gör <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <CategoryGrid />
        </section>

        {/* Featured Products */}
        <section className="bg-white border-y border-slate-100 py-14">
          <div className="page-container">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-accent-600 font-medium text-sm mb-1">Seçilmiş məhsullar</p>
                <h2 className="section-title">Ən çox satılanlar</h2>
              </div>
              <Link href="/products" className="btn btn-secondary btn-sm hidden sm:flex">
                Hamısını gör <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <FeaturedProducts />
          </div>
        </section>

        {/* CTA Banner */}
        <section className="page-container py-14">
          <div className="rounded-3xl bg-gradient-to-r from-accent-500 to-accent-600 p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-6 text-white overflow-hidden relative">
            <div className="absolute -right-10 -top-10 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-3">
                🎒 Yeni dərs ili başlayır!
              </h2>
              <p className="text-accent-100 text-lg">
                Hər şeyi bir yerdə tapın. Sürətli çatdırılma, keyfiyyətli məhsullar.
              </p>
            </div>
            <Link href="/products" className="relative btn btn-lg bg-white text-accent-600 hover:bg-accent-50 shadow-lg flex-shrink-0">
              İndi al <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
