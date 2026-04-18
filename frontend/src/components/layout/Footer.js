import Link from 'next/link';
import { BookOpen, Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-white block leading-none">Məktəb</span>
                <span className="text-xs text-primary-400 leading-none">Ləvazimatları</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Bakı-nın ən böyük məktəb ləvazimatları mağazası. Keyfiyyətli məhsullar, sərfəli qiymətlər.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Məhsullar</h3>
            <ul className="space-y-2 text-sm">
              {[['Çantalar', '/products?category=backpacks'], ['Dəftərlər', '/products?category=notebooks'], ['Qələmlər', '/products?category=pens-pencils'], ['Rəsm Ləvazimatları', '/products?category=art-supplies']].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Hesab</h3>
            <ul className="space-y-2 text-sm">
              {[['Giriş', '/login'], ['Qeydiyyat', '/register'], ['Sifarişlərim', '/account/orders'], ['Profil', '/account']].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Əlaqə</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary-400 flex-shrink-0" /><span>+994 12 345 67 89</span></li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary-400 flex-shrink-0" /><span>info@mekteb.az</span></li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" /><span>Bakı şəhəri, Nərimanov rayonu, Əliağa Vahid küçəsi 15</span></li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary-700 transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary-700 transition-colors"><Facebook className="w-4 h-4" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-slate-500">
          <p>© 2025 Məktəb Ləvazimatları. Bütün hüquqlar qorunur.</p>
          <p>Bakı, Azərbaycan 🇦🇿</p>
        </div>
      </div>
    </footer>
  );
}
