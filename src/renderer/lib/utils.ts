import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPath(filePath?: string): string {
  if (!filePath) return 'Not configured';
  const parts = filePath.split(/[/\\]/);
  return parts[parts.length - 1] || filePath;
}
