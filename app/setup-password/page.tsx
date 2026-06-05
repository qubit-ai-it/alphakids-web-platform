'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/shared/components/ui/Input';
import { PasswordInput } from '@/shared/components/auth/PasswordInput';
import { Button } from '@/shared/components/ui/Button';
import { authService } from '@/features/auth/services/auth.service';

function SetupForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Mínimo 8 caracteres'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return; }
    setIsLoading(true);
    try {
      await authService.setupPassword(token ?? '', password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al configurar contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-600 text-[14px] mb-[16px]">Enlace inválido.</p>
        <Link href="/login" className="text-primary-500 font-medium">Ir al inicio</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-[64px] h-[64px] bg-green-100 rounded-[16px] flex items-center justify-center mx-auto mb-[16px]">
          <span className="material-symbols-outlined text-[32px] text-green-600">check_circle</span>
        </div>
        <h1 className="text-[24px] font-bold text-secondary-900 mb-[8px]">¡Contraseña configurada!</h1>
        <p className="text-[14px] text-secondary-600 mb-[24px]">Ahora podés iniciar sesión con tu nueva contraseña.</p>
        <Link href="/login" className="btn btn-primary btn-md w-full text-center no-underline">Iniciar Sesión</Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-[24px] font-bold text-secondary-900 text-center mb-[8px]">Configurá tu contraseña</h1>
      <p className="text-[14px] text-secondary-600 text-center mb-[24px]">Elegí una contraseña para acceder a tu cuenta.</p>
      {error && <div className="mb-[16px] p-[12px] bg-red-100 text-red-700 rounded-[8px] text-[14px]">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
        <PasswordInput label="Contraseña" placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
        <Input label="Confirmar contraseña" type="password" placeholder="Repetí la contraseña" value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={isLoading} />
        <Button type="submit" disabled={isLoading || !password || !confirm}>{isLoading ? 'Guardando...' : 'Configurar'}</Button>
      </form>
    </>
  );
}

export default function SetupPasswordPage() {
  return (
    <div className="w-full min-h-screen bg-secondary-50 flex items-center justify-center p-[40px] font-sans">
      <div className="w-full max-w-[480px] bg-white p-[32px] sm:p-[48px] rounded-[32px] shadow-xl flex flex-col">
        <Suspense fallback={<div className="spinner spinner-lg mx-auto" />}>
          <SetupForm />
        </Suspense>
      </div>
    </div>
  );
}
