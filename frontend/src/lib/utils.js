import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price) {
  return new Intl.NumberFormat('az-AZ', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price) + ' ₼';
}

export function formatDate(dateStr) {
  return new Intl.DateTimeFormat('az-AZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export const ORDER_STATUS_LABELS = {
  PENDING:    { label: 'Gözləyir',      color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED:  { label: 'Təsdiqləndi',   color: 'bg-blue-100 text-blue-800'   },
  PROCESSING: { label: 'Hazırlanır',    color: 'bg-purple-100 text-purple-800'},
  SHIPPED:    { label: 'Göndərildi',    color: 'bg-indigo-100 text-indigo-800'},
  DELIVERED:  { label: 'Çatdırıldı',   color: 'bg-green-100 text-green-800'  },
  CANCELLED:  { label: 'Ləğv edildi',   color: 'bg-red-100 text-red-800'     },
};

export function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.message ||
    'Xəta baş verdi'
  );
}

export function truncate(str, n = 80) {
  return str?.length > n ? str.substring(0, n) + '…' : str;
}
