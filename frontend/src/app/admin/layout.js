'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users,
  LogOut, Menu, X, BookOpen, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin',           icon: LayoutDashboard, label: 'Göstərici paneli' },
  { href: '/admin/products',  icon: Package,         label: 'Məhsullar'        },
  { href: '/admin/categories',icon: Tag,             label: 'Kateqoriyalar'    },
  { href: '/admin/orders',    icon: ShoppingBag,     label: 'Sifarişlər'       },
  { href: '/admin/users',     icon: Users,           label: 'İstifadəçilər'    },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/login');
    }
  }, []);

  if (!isAuthenticated() || !isAdmin()) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-50 transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-sm block leading-none text-white">Məktəb</span>
            <span className="text-xs text-slate-400 leading-none">Admin Panel</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const exact = href === '/admin';
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary-700 flex items-center justify-center text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="btn btn-ghost btn-sm text-slate-400 hover:text-white flex-1 text-xs">
              Mağaza
            </Link>
            <button onClick={logout} className="btn btn-sm text-slate-400 hover:text-red-400 flex-1 text-xs">
              <LogOut className="w-3.5 h-3.5" /> Çıxış
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center gap-4 px-4 lg:px-6 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn btn-ghost btn-sm">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-800">
              {NAV.find(n => n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href))?.label || 'Admin'}
            </p>
          </div>
          <span className="badge bg-primary-100 text-primary-700 text-xs">Admin</span>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
