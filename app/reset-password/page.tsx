'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/shared/components/ui/Input';
import { PasswordInput } from '@/shared/components/auth/PasswordInput';
import { Button } from '@/shared/components/ui/Button';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/errors';
import { authService } from '@/features/auth/services/auth.service';

const resetSchema = z.object({
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^a-zA-Z0-9]/, 'Debe contener al menos un símbolo (ej: _ . @ #)'),
  confirm: z.string().min(1, 'Confirmá la contraseña'),
}).refine((data) => data.password === data.confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm'],
});

type ResetFormData = z.infer<typeof resetSchema>;

function getPasswordStrength(pw: string): { level: number; label: string; color: string; width: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  if (score <= 1) return { level: score, label: 'Débil', color: 'bg-red-500', width: '25%' };
  if (score === 2) return { level: score, label: 'Media', color: 'bg-yellow-500', width: '50%' };
  if (score === 3) return { level: score, label: 'Buena', color: 'bg-lime-500', width: '75%' };
  return { level: score, label: 'Fuerte', color: 'bg-green-500', width: '100%' };
}

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    mode: 'onTouched',
    defaultValues: { password: '', confirm: '' },
  });

  const password = watch('password') ?? '';
  const strength = getPasswordStrength(password);

  const onInvalid = () => {
    addToast('error', 'El formulario se llenó incorrectamente');
    for (const [, error] of Object.entries(errors)) {
      if (error?.message && typeof error.message === 'string') {
        addToast('error', error.message);
      }
    }
  };

  const onSubmit = async (data: ResetFormData) => {
    try {
      await authService.resetPassword(token ?? '', data.password);
      addToast('success', 'Contraseña restablecida');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      const { title, message } = getErrorMessage(err);
      addToast('error', title, message);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-600 text-[14px] mb-[16px]">Enlace inválido. No se encontró el token.</p>
        <Link href="/login" className="text-primary-500 font-medium">Ir al inicio</Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-[24px] font-bold text-secondary-900 text-center mb-[8px]">Nueva contraseña</h1>
      <p className="text-[14px] text-secondary-600 text-center mb-[24px]">Ingresá tu nueva contraseña para restablecer el acceso.</p>
      <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-[20px]">
        <PasswordInput label="Nueva contraseña" placeholder="Mínimo 8 caracteres" error={errors.password?.message} {...register('password')} />
        {password.length > 0 && (
          <div className="-mt-[12px]">
            <div className="w-full h-[6px] bg-secondary-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
            </div>
            <p className="text-[11px] text-secondary-500 mt-[4px]">Seguridad: {strength.label}</p>
          </div>
        )}
        <Input label="Confirmar contraseña" type="password" placeholder="Repetí la contraseña" error={errors.confirm?.message} {...register('confirm')} />
        <Button type="submit">Restablecer</Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full min-h-screen bg-secondary-50 flex items-center justify-center p-[40px] font-sans">
      <div className="w-full max-w-[480px] bg-white p-[32px] sm:p-[48px] rounded-[32px] shadow-xl flex flex-col">
        <Suspense fallback={<div className="spinner spinner-lg mx-auto" />}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
