'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

const ICONS = ['🎒','📓','✏️','🎨','📐','📁','📚','🖊️','📏','🖍️','📌','🗂️'];

function CategoryModal({ cat, onClose }) {
  const qc = useQueryClient();
  const isEdit = !!cat?.id;
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: cat || { icon: '📦' }
  });
  const selectedIcon = watch('icon');

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? api.put(`/categories/${cat.id}`, data) : api.post('/categories', data),
    onSuccess: () => {
      toast.success(isEdit ? 'Yeniləndi' : 'Yaradıldı');
      qc.invalidateQueries(['categories']);
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card p-6 w-full max-w-md animate-slide-up">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-display font-semibold text-lg">{isEdit ? 'Kateqoriyanı redaktə et' : 'Yeni kateqoriya'}</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm rounded-full"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Ad (Azərbaycanca) *</label>
            <input {...register('nameAz', { required: 'Tələb olunur' })} className={`input ${errors.nameAz ? 'input-error' : ''}`} placeholder="Çantalar" />
            {errors.nameAz && <p className="text-red-500 text-xs mt-1">{errors.nameAz.message}</p>}
          </div>
          <div>
            <label className="label">Ad (İngiliscə) *</label>
            <input {...register('name', { required: 'Tələb olunur' })} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Backpacks" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Təsvir</label>
            <input {...register('description')} className="input" placeholder="Kateqoriya haqqında qısa məlumat" />
          </div>
          <div>
            <label className="label">İkon</label>
            <div className="flex flex-wrap gap-2 p-3 border border-slate-200 rounded-xl">
              {ICONS.map(icon => (
                <button key={icon} type="button" onClick={() => setValue('icon', icon)}
                  className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all ${selectedIcon === icon ? 'bg-primary-100 ring-2 ring-primary-500' : 'hover:bg-slate-100'}`}>
                  {icon}
                </button>
              ))}
            </div>
            <input {...register('icon')} type="hidden" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Ləğv et</button>
            <button type="submit" disabled={mutation.isPending} className="btn btn-primary flex-1">
              <Save className="w-4 h-4" /> {isEdit ? 'Yenilə' : 'Yarat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => { toast.success('Silindi'); qc.invalidateQueries(['categories']); setDeleteId(null); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Kateqoriyalar</h1>
          <p className="text-slate-500 text-sm mt-1">{categories?.length || 0} kateqoriya</p>
        </div>
        <button onClick={() => setModal({})} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Yeni kateqoriya
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)
          : categories?.map(cat => (
            <div key={cat.id} className="card p-5 flex items-center gap-4 group">
              <div className="text-4xl flex-shrink-0">{cat.icon || '📦'}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 truncate">{cat.nameAz}</h3>
                <p className="text-xs text-slate-400 truncate">{cat.name}</p>
                <p className="text-xs text-primary-600 mt-1">{cat._count?.products || 0} məhsul</p>
              </div>
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setModal(cat)}
                  className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteId(cat.id)}
                  className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        }
      </div>

      {modal !== null && <CategoryModal cat={modal} onClose={() => setModal(null)} />}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-8 max-w-sm w-full text-center animate-slide-up">
            <p className="text-4xl mb-4">🗑️</p>
            <h2 className="font-display font-bold text-xl mb-2">Silmək istəyirsiniz?</h2>
            <p className="text-slate-500 text-sm mb-6">Məhsulları olan kateqoriyalar silinə bilməz.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn btn-secondary flex-1">Ləğv et</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} className="btn btn-danger flex-1">Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
