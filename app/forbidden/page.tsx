'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/Button';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="text-center max-w-[480px] px-[24px]">
        <div className="w-[80px] h-[80px] rounded-full bg-red-100 flex items-center justify-center mx-auto mb-[24px]">
          <span className="material-symbols-outlined text-[40px] text-red-500">block</span>
        </div>
        <h1 className="text-[36px] font-extrabold text-secondary-900 mb-[8px]">403</h1>
        <h2 className="text-[18px] font-semibold text-secondary-700 mb-[12px]">Acceso denegado</h2>
        <p className="text-[14px] text-secondary-600 mb-[8px]">
          No tenés permisos para acceder a esta sección.
        </p>
        <p className="text-[13px] text-secondary-500 mb-[32px]">
          Si creés que esto es un error, contactá al administrador del sistema.
        </p>
        <div className="flex items-center justify-center gap-[12px]">
          <Button variant="secondary" size="sm" onClick={() => router.back()}>
            Volver atrás
          </Button>
          <Button size="sm" onClick={() => router.push('/dashboard')}>
            Ir al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
