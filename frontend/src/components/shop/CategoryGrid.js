import Link from 'next/link';
import api from '@/lib/api';

async function getCategories() {
  try {
    const { data } = await api.get('/categories');
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function CategoryGrid() {
  const categories = await getCategories();
  if (!categories.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map(cat => (
        <Link
          key={cat.id}
          href={`/products?category=${cat.slug}`}
          className="group card p-5 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:border-primary-200"
        >
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
            {cat.icon || '📦'}
          </div>
          <h3 className="font-semibold text-sm text-slate-800 group-hover:text-primary-700 transition-colors leading-snug">
            {cat.nameAz}
          </h3>
          {cat._count && (
            <p className="text-xs text-slate-400 mt-1">{cat._count.products} məhsul</p>
          )}
        </Link>
      ))}
    </div>
  );
}
