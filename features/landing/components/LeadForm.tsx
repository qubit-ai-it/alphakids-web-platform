'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/shared/lib/api-client';
import { leadSchema, type LeadFormData } from '@/features/landing/schema/lead.schema';
import { QrDownloadModal } from '@/features/landing/components/QrDownloadModal';

function detectSource(): string {
  if (typeof window === 'undefined') return 'directo';
  const url = new URL(window.location.href);
  const ref = url.searchParams.get('ref');
  if (ref) return ref;
  const referrer = document.referrer || '';
  if (referrer.includes('instagram')) return 'instagram';
  if (referrer.includes('tiktok')) return 'tiktok';
  if (referrer.includes('facebook')) return 'facebook';
  if (referrer.includes('google')) return 'google';
  return 'directo';
}

interface ApiFailure {
  status?: number;
  message?: string;
}

function classifyError(err: unknown): { message: string } {
  const failure = err as ApiFailure;
  if (failure?.status === 409) {
    return { message: 'Este correo ya está registrado. Revisa tu casilla para continuar.' };
  }
  if (failure?.status === 429) {
    return { message: 'Demasiados intentos. Prueba de nuevo en unos minutos.' };
  }
  if (typeof failure?.status === 'number' && failure.status >= 400 && failure.status < 500) {
    return { message: 'Revisa los datos ingresados e intenta de nuevo.' };
  }
  return { message: 'Algo salió mal. ¿Puedes intentar de nuevo?' };
}

export default function LeadForm() {
  const [showQrModal, setShowQrModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const source = detectSource();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    mode: 'onSubmit',
    defaultValues: { name: '', email: '' },
  });

  const onSubmit = async (data: LeadFormData) => {
    setErrorMessage(null);
    try {
      await api.post('/api/leads', { name: data.name.trim(), email: data.email.trim() });
      setShowQrModal(true);
      reset({ name: '', email: '' });
    } catch (err) {
      setErrorMessage(classifyError(err).message);
    }
  };

  return (
    <section id="lead-form" className="bg-secondary-50 py-[80px] md:py-[100px]">
      <div className="mx-auto max-w-[600px] px-[24px] space-y-[24px]">
        {/* ─── Form Card ─── */}
        <div className="card text-center py-[60px]">
          <span className="material-symbols-outlined mb-[16px] text-[56px] text-primary-500">
            auto_stories
          </span>

          <h2 className="mb-[8px] text-[28px] font-bold text-secondary-900 md:text-[32px]">
            ¿Quieres probar AlphaKids?
          </h2>

          <p className="text-[15px] text-secondary-600 mb-[28px] max-w-[400px] mx-auto">
            Déjanos tu nombre y correo. Te escribimos para que descargues la app y
            empieces con tus hijos.
          </p>

          {/* Inline error feedback */}
          {errorMessage && (
            <div className="mb-[20px] mx-auto max-w-[480px] px-[20px] py-[12px] bg-red-50 text-red-600 rounded-[10px] text-[14px] font-medium">
              {errorMessage}
            </div>
          )}

          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-[480px] mx-auto flex flex-col gap-[16px]"
          >
            <div className="flex flex-col gap-[4px] text-left">
              <input
                type="text"
                placeholder="Tu nombre"
                aria-label="Tu nombre"
                disabled={isSubmitting}
                autoComplete="name"
                {...register('name')}
                className={`
                  w-full
                  px-[16px]
                  py-[14px]
                  rounded-[10px]
                  border bg-white
                  text-secondary-900
                  text-[15px]
                  outline-none
                  focus:ring-2
                  focus:ring-primary-500
                  focus:border-transparent
                  transition-all
                  placeholder:text-secondary-400
                  disabled:opacity-50
                  ${errors.name ? 'border-red-500' : 'border-secondary-200'}
                `}
              />
              {errors.name && (
                <span className="text-red-600 text-[12px] px-[4px]">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-[4px] text-left">
              <input
                type="email"
                placeholder="tu@correo.com"
                aria-label="Tu correo electrónico"
                disabled={isSubmitting}
                autoComplete="email"
                {...register('email')}
                className={`
                  w-full
                  px-[16px]
                  py-[14px]
                  rounded-[10px]
                  border bg-white
                  text-secondary-900
                  text-[15px]
                  outline-none
                  focus:ring-2
                  focus:ring-primary-500
                  focus:border-transparent
                  transition-all
                  placeholder:text-secondary-400
                  disabled:opacity-50
                  ${errors.email ? 'border-red-500' : 'border-secondary-200'}
                `}
              />
              {errors.email && (
                <span className="text-red-600 text-[12px] px-[4px]">
                  {errors.email.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="
                btn
                btn-primary
                btn-lg
                whitespace-nowrap
                inline-flex
                items-center
                justify-center
                gap-[8px]
                disabled:opacity-50
              "
            >
              {isSubmitting ? (
                <>
                  <span className="spinner spinner-sm" />
                  Enviando…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  Enviar
                </>
              )}
            </button>
          </form>

          {/* Source badge (informational, hidden on small) */}
          {source !== 'directo' && (
            <p className="mt-[16px] text-[12px] text-secondary-400 hidden sm:block">
              Vía: {source}
            </p>
          )}
        </div>
      </div>

      <QrDownloadModal isOpen={showQrModal} onClose={() => setShowQrModal(false)} />
    </section>
  );
}