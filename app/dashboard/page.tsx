'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    const primaryRole = user.roles[0]?.role.name;

    switch (primaryRole) {
      case 'admin':
        router.replace('/dashboard/admin/instituciones');
        break;
      case 'director':
        router.replace('/dashboard/director/grados');
        break;
      case 'teacher':
        router.replace('/dashboard/docente/aula');
        break;
      case 'parent':
        router.replace('/dashboard');
        break;
      default:
        router.replace('/login');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-100">
      <div className="spinner spinner-lg" />
    </div>
  );
}
