import ProductForm from '@/components/admin/ProductForm';

export const metadata = { title: 'Yeni Məhsul | Admin' };

export default function NewProductPage() {
  return <ProductForm isEdit={false} />;
}
