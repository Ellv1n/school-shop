import api from '@/lib/api';
import ProductCard from './ProductCard';

async function getFeaturedProducts() {
  try {
    const { data } = await api.get('/products/featured');
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();
  if (!products.length) return <p className="text-slate-500 text-center py-8">Məhsul tapılmadı.</p>;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
