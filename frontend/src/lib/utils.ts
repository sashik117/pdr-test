import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDuration(startedAt: string, completedAt: string): string {
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const durationMs = end - start;

  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes} хв ${seconds} с`;
  }
  return `${seconds} с`;
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-success-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-error-600';
}

export function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-success-100';
  if (score >= 70) return 'bg-yellow-100';
  return 'bg-error-100';
}
