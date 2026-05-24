'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { authService } from '@/features/auth/services/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el enlace');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-secondary-50 flex items-center justify-center p-[40px] font-sans">
      <div className="w-full max-w-[480px] bg-white p-[32px] sm:p-[48px] rounded-[32px] shadow-xl flex flex-col">
        <div className="flex justify-center mb-[24px]">
          <div className="w-[64px] h-[64px] bg-primary-100 rounded-[16px] flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-primary-500">lock_reset</span>
          </div>
        </div>

        {sent ? (
          <>
            <h1 className="text-[24px] font-bold text-secondary-900 text-center mb-[16px]">
              Revisá tu correo
            </h1>
            <p className="text-[14px] text-secondary-600 text-center mb-[24px]">
              Si el email <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña.
            </p>
            <Link href="/login" className="btn btn-primary btn-md w-full text-center no-underline">
              Volver a Iniciar Sesión
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-[24px] font-bold text-secondary-900 text-center mb-[8px]">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-[14px] text-secondary-600 text-center mb-[24px]">
              Ingresá tu correo y te enviaremos un enlace para restablecerla.
            </p>

            {error && (
              <div className="mb-[16px] p-[12px] bg-red-100 text-red-700 rounded-[8px] text-[14px]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-[24px]">
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !email}>
                {isLoading ? 'Enviando...' : 'Enviar enlace'}
              </Button>
            </form>

            <div className="text-center mt-[16px]">
              <Link href="/login" className="text-[14px] text-primary-500 font-medium hover:text-primary-600 transition-colors">
                Volver a Iniciar Sesión
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
