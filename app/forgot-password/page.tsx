'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/errors';
import { authService } from '@/features/auth/services/auth.service';
import { canSendEmail, recordSend, getCooldownRemaining } from '@/shared/lib/email-rate-limit';

const forgotSchema = z.object({
  email: z.string().min(1, 'Falta el correo').email('Correo inválido'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

const COOLDOWN_MSGS = [
  'Podés reenviar en 1 minuto',
  'Podés reenviar en 1 minuto',
  'Podés reenviar en 2 minutos',
  'Podés reenviar en 2 minutos',
  'Podés reenviar en 6 minutos',
  'Límite del día alcanzado. Volvé a intentar mañana.',
];

export default function ForgotPasswordPage() {
  const { addToast } = useToast();
  const [sent, setSent] = React.useState(false);
  const [sentEmail, setSentEmail] = React.useState('');
  const [cooldown, setCooldown] = useState(0);
  const [emailValue, setEmailValue] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  const watchedEmail = watch('email');

  useEffect(() => {
    setEmailValue(watchedEmail ?? '');
  }, [watchedEmail]);

  useEffect(() => {
    if (!emailValue) return;
    const remaining = getCooldownRemaining(emailValue);
    if (remaining <= 0) { setCooldown(0); return; }

    setCooldown(remaining);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        const next = Math.max(0, prev - 1);
        if (next <= 0) clearInterval(interval);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [emailValue, sent]);

  const onInvalid = () => {
    addToast('error', 'El formulario se llenó incorrectamente');
    for (const [, error] of Object.entries(errors)) {
      if (error?.message && typeof error.message === 'string') {
        addToast('error', error.message);
      }
    }
  };

  const onSubmit = async (data: ForgotFormData) => {
    const { allowed, remaining } = canSendEmail(data.email);
    if (!allowed) {
      setCooldown(remaining);
      addToast('error', 'Esperá antes de reenviar');
      return;
    }

    try {
      await authService.forgotPassword(data.email);
      recordSend(data.email);
      const newRemaining = getCooldownRemaining(data.email);
      setCooldown(newRemaining);
      setSentEmail(data.email);
      setSent(true);
      addToast('success', 'Enlace enviado', 'Revisá tu correo para restablecer la contraseña.');
    } catch (err) {
      const { title, message } = getErrorMessage(err);
      addToast('error', title, message);
    }
  };

  const formatCooldown = (s: number) => {
    if (s >= 86400) return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
    if (s >= 3600) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
    if (s >= 60) return `${Math.floor(s / 60)}m ${s % 60}s`;
    return `${s}s`;
  };

  const getCooldownMsg = (email: string) => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('email_cooldown') : null;
    if (!raw) return '';
    try {
      const state = JSON.parse(raw);
      if (state.email !== email) return '';
      const index = Math.min(state.sendCount - 1, COOLDOWN_MSGS.length - 1);
      return COOLDOWN_MSGS[index];
    } catch { return ''; }
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
              Si el email <strong>{sentEmail}</strong> está registrado, recibirás un enlace para restablecer tu contraseña.
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

            <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-[24px]">
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="tu@correo.com"
                error={errors.email?.message}
                disabled={false}
                {...register('email')}
              />
              <Button type="submit" disabled={cooldown > 0 || !emailValue}>
                {cooldown > 0 ? `Reenviar en ${formatCooldown(cooldown)}` : 'Enviar enlace'}
              </Button>
              {cooldown > 0 && emailValue && (
                <p className="text-[12px] text-secondary-500 text-center -mt-[16px]">
                  {getCooldownMsg(emailValue)}
                </p>
              )}
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
