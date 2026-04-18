'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { BookOpen, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await login(data.email, data.password);
      if (result.user.role === 'ADMIN') router.push('/admin');
      else router.push('/');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className="font-display font-bold text-xl text-slate-900 block leading-none">Məktəb</span>
              <span className="text-sm text-primary-600 font-medium leading-none">Ləvazimatları</span>
            </div>
          </Link>
          <h1 className="font-display text-2xl font-bold text-slate-900 mt-6">Xoş gəldiniz!</h1>
          <p className="text-slate-500 mt-1 text-sm">Hesabınıza daxil olun</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">E-poçt</label>
              <input
                {...register('email', {
                  required: 'E-poçt tələb olunur',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Düzgün e-poçt daxil edin' }
                })}
                type="email"
                placeholder="ad@example.com"
                className={`input ${errors.email ? 'input-error' : ''}`}
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Şifrə</label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Şifrə tələb olunur' })}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary w-full btn-lg mt-2">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Daxil olunur...
                </span>
              ) : (
                <><LogIn className="w-5 h-5" /> Daxil ol</>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 p-4 bg-blue-50 rounded-xl text-xs text-blue-700 space-y-1.5 border border-blue-100">
            <p className="font-semibold text-blue-800">🧪 Demo giriş məlumatları:</p>
            <p>Admin: <span className="font-mono">admin@mekteb.az</span> / <span className="font-mono">admin123</span></p>
            <p>Müştəri: <span className="font-mono">aynur@example.com</span> / <span className="font-mono">customer123</span></p>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Hesabınız yoxdur?{' '}
          <Link href="/register" className="text-primary-600 font-medium hover:underline">
            Qeydiyyatdan keçin
          </Link>
        </p>
      </div>
    </div>
  );
}
