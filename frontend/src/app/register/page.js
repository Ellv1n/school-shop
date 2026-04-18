'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { BookOpen, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      const { confirm, ...payload } = data;
      await registerUser(payload);
      router.push('/');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className="font-display font-bold text-xl text-slate-900 block leading-none">Məktəb</span>
              <span className="text-sm text-primary-600 font-medium leading-none">Ləvazimatları</span>
            </div>
          </Link>
          <h1 className="font-display text-2xl font-bold text-slate-900 mt-6">Hesab yaradın</h1>
          <p className="text-slate-500 mt-1 text-sm">Qeydiyyat tamamilə pulsuzdur</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Ad Soyad</label>
              <input {...register('name', { required: 'Ad tələb olunur', minLength: { value: 2, message: 'Ən az 2 hərf' } })}
                type="text" placeholder="Aynur Həsənova"
                className={`input ${errors.name ? 'input-error' : ''}`} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">E-poçt</label>
              <input {...register('email', {
                required: 'E-poçt tələb olunur',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Düzgün e-poçt daxil edin' }
              })}
                type="email" placeholder="ad@example.com"
                className={`input ${errors.email ? 'input-error' : ''}`} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Telefon (isteğe bağlı)</label>
              <input {...register('phone')}
                type="tel" placeholder="+994 50 123 45 67"
                className="input" />
            </div>

            <div>
              <label className="label">Şifrə</label>
              <div className="relative">
                <input {...register('password', {
                  required: 'Şifrə tələb olunur',
                  minLength: { value: 6, message: 'Ən az 6 hərf' }
                })}
                  type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Şifrəni təsdiq edin</label>
              <input {...register('confirm', {
                required: 'Şifrəni təsdiq edin',
                validate: v => v === password || 'Şifrələr uyğun gəlmir'
              })}
                type="password" placeholder="••••••••"
                className={`input ${errors.confirm ? 'input-error' : ''}`} />
              {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary w-full btn-lg mt-2">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Qeydiyyat edilir...
                </span>
              ) : (
                <><UserPlus className="w-5 h-5" /> Qeydiyyatdan keç</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Hesabınız var?{' '}
          <Link href="/login" className="text-primary-600 font-medium hover:underline">Daxil olun</Link>
        </p>
      </div>
    </div>
  );
}
