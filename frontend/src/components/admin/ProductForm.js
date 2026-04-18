'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, X, Save, ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import { getImageUrl, getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProductFormPage({ isEdit = false }) {
  const router = useRouter();
  const params = useParams();
  const qc = useQueryClient();
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
  });

  const { data: existing } = useQuery({
    queryKey: ['product', params?.id],
    queryFn: () => api.get(`/products/${params.id}`).then(r => r.data.data),
    enabled: isEdit && !!params?.id,
  });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        nameAz: existing.nameAz,
        description: existing.description || '',
        descriptionAz: existing.descriptionAz || '',
        price: existing.price,
        stock: existing.stock,
        categoryId: existing.categoryId,
        featured: existing.featured,
        isActive: existing.isActive,
      });
      if (existing.image) setPreview(getImageUrl(existing.image));
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: (formData) => {
      if (isEdit) return api.put(`/products/${params.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Məhsul yeniləndi' : 'Məhsul yaradıldı');
      qc.invalidateQueries(['admin-products']);
      router.push('/admin/products');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, v);
    });
    if (fileRef.current?.files[0]) fd.append('image', fileRef.current.files[0]);
    mutation.mutate(fd);
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Yalnız şəkil faylları'); return; }
    setPreview(URL.createObjectURL(file));
    // store in ref
    const dt = new DataTransfer();
    dt.items.add(file);
    fileRef.current.files = dt.files;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin/products')} className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          {isEdit ? 'Məhsulu redaktə et' : 'Yeni məhsul əlavə et'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Image Upload */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary-600" /> Şəkil
          </h2>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragOver ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
            }`}
          >
            {preview ? (
              <div className="relative">
                <Image src={preview} alt="Preview" width={300} height={200} className="mx-auto rounded-xl object-cover max-h-52 w-auto" />
                <button type="button" onClick={e => { e.stopPropagation(); setPreview(null); }}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="py-4">
                <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Şəkil yükləyin</p>
                <p className="text-slate-400 text-sm mt-1">Sürüklə-burax və ya seçmək üçün klikləyin</p>
                <p className="text-slate-300 text-xs mt-2">PNG, JPG, WebP — maks 5MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleFile(e.target.files[0])} />
          </div>
        </div>

        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Əsas məlumatlar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Ad (Azərbaycanca) *</label>
              <input {...register('nameAz', { required: 'Tələb olunur' })} className={`input ${errors.nameAz ? 'input-error' : ''}`} placeholder="Məktəb Çantası" />
              {errors.nameAz && <p className="text-red-500 text-xs mt-1">{errors.nameAz.message}</p>}
            </div>
            <div>
              <label className="label">Ad (İngiliscə) *</label>
              <input {...register('name', { required: 'Tələb olunur' })} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="School Backpack" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Qiymət (₼) *</label>
              <input {...register('price', { required: 'Tələb olunur', min: { value: 0, message: 'Min 0' } })}
                type="number" step="0.01" className={`input ${errors.price ? 'input-error' : ''}`} placeholder="0.00" />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="label">Stok *</label>
              <input {...register('stock', { required: 'Tələb olunur', min: { value: 0, message: 'Min 0' } })}
                type="number" className={`input ${errors.stock ? 'input-error' : ''}`} placeholder="0" />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="label">Kateqoriya *</label>
              <select {...register('categoryId', { required: 'Tələb olunur' })} className={`input ${errors.categoryId ? 'input-error' : ''}`}>
                <option value="">Kateqoriya seçin</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.nameAz}</option>)}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Təsvir</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Azərbaycanca</label>
              <textarea {...register('descriptionAz')} rows={3} className="input resize-none" placeholder="Məhsulun Azərbaycanca təsviri..." />
            </div>
            <div>
              <label className="label">İngiliscə</label>
              <textarea {...register('description')} rows={3} className="input resize-none" placeholder="Product description in English..." />
            </div>
          </div>
        </div>

        {/* Flags */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Parametrlər</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input {...register('featured')} type="checkbox" className="w-4 h-4 rounded text-primary-600" />
              <span className="text-sm font-medium text-slate-700">Seçilmiş məhsul</span>
            </label>
            {isEdit && (
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input {...register('isActive')} type="checkbox" className="w-4 h-4 rounded text-primary-600" />
                <span className="text-sm font-medium text-slate-700">Aktiv</span>
              </label>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="button" onClick={() => router.push('/admin/products')} className="btn btn-secondary flex-1">
            Ləğv et
          </button>
          <button type="submit" disabled={mutation.isPending} className="btn btn-primary flex-1">
            {mutation.isPending ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Yadda saxlanılır...</>
            ) : (
              <><Save className="w-4 h-4" /> {isEdit ? 'Yenilə' : 'Yarat'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
