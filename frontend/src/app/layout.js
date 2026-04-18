import { Inter, Lexend } from 'next/font/google';
import './globals.css';
import Providers from '@/components/layout/Providers';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

const lexend = Lexend({ 
  subsets: ['latin'], 
  variable: '--font-lexend',
  display: 'swap',
});

export const metadata = {
  title: 'Məktəb Ləvazimatları | School Supplies Store',
  description: 'Bakı-nın ən böyük məktəb ləvazimatları mağazası. Çantalar, dəftərlər, qələmlər və daha çox.',
  keywords: 'məktəb, ləvazimatlar, çanta, dəftər, qələm, Bakı',
};

export default function RootLayout({ children }) {
  return (
    <html lang="az" className={`${inter.variable} ${lexend.variable}`}>
      <body className="font-sans bg-slate-50 text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
