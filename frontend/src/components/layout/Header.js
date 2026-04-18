'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ShoppingCart, Menu, X, User, LogOut, LayoutDashboard,
  BookOpen, Search, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isAdmin } = useAuthStore();
  const { getItemCount, setOpen: setCartOpen, fetchCart } = useCartStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const authenticated = isAuthenticated();
  const admin = isAdmin();
  const cartCount = getItemCount(authenticated);

  useEffect(() => {
    if (authenticated) fetchCart();
  }, [authenticated]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Ana səhifə' },
    { href: '/products', label: 'Məhsullar' },
    { href: '/products?category=backpacks', label: 'Çantalar' },
    { href: '/products?category=notebooks', label: 'Dəftərlər' },
  ];

  return (
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'
    )}>
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-lg text-slate-900 leading-none block">Məktəb</span>
              <span className="text-xs text-primary-600 font-medium leading-none">Ləvazimatları</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3.5 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link href="/products?search=" className="btn btn-ghost btn-sm hidden sm:flex">
              <Search className="w-4 h-4" />
            </Link>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative btn btn-ghost btn-sm"
              aria-label="Səbət"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] px-1">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {authenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(p => !p)}
                  className="flex items-center gap-2 btn btn-secondary btn-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden sm:block max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1 animate-fade-in z-50">
                    {admin && (
                      <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                        <LayoutDashboard className="w-4 h-4 text-primary-600" />
                        Admin Panel
                      </Link>
                    )}
                    <Link href="/account" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <User className="w-4 h-4" />
                      Hesabım
                    </Link>
                    <Link href="/account/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <BookOpen className="w-4 h-4" />
                      Sifarişlərim
                    </Link>
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={logout}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıxış
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn btn-primary btn-sm">
                Giriş
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(p => !p)}
              className="lg:hidden btn btn-ghost btn-sm"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-100 py-3 space-y-1 animate-fade-in">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
