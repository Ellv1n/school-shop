'use client';
import { useQuery } from '@tanstack/react-query';
import { Users, ShoppingBag } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then(r => r.data),
  });

  const users = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">İstifadəçilər</h1>
        <p className="text-slate-500 text-sm mt-1">{data?.pagination?.total || 0} istifadəçi</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['İstifadəçi', 'E-poçt', 'Telefon', 'Rol', 'Sifarişlər', 'Qeydiyyat tarixi'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="skeleton h-12 rounded-lg" /></td></tr>
                ))
                : users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-sm text-slate-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{user.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role === 'ADMIN' ? 'Admin' : 'Müştəri'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                        {user._count?.orders || 0}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatDate(user.createdAt)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        {users.length === 0 && !isLoading && (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>İstifadəçi tapılmadı</p>
          </div>
        )}
      </div>
    </div>
  );
}
