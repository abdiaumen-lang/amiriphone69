import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDZD(amount: number) {
  return new Intl.NumberFormat('fr-DZ', { 
    style: 'currency', 
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('DZD', 'DA');
}

export function getSafeImageUrl(url: string | null | undefined) {
  if (!url) return "";
  if (typeof url !== 'string') return "";
  // Convert absolute localhost URLs to relative to work with Vite proxy
  return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):8080\//, "/");
}
