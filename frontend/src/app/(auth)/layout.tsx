'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, _hasHydrated, router]);

  // Wait for hydration before rendering
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
          <Car className="w-7 h-7 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900">ПДР Тест</span>
      </Link>
      {children}
    </div>
  );
}
