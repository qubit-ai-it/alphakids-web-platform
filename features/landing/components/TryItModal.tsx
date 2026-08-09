'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/shared/lib/api-client';
import { leadSchema, type LeadFormData } from '@/features/landing/schema/lead.schema';
import { Modal } from '@/shared/components/ui/Modal';
import { Icon } from '@/shared/components/ui/Icon';
import { classifyLeadError } from '@/features/landing/lib/classify-lead-error';

interface TryItModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * "Pruébalo ya" entry point triggered from the LoginForm.
 *
 * Reuses the landing lead schema and the shared error classifier so the data
 * shape and failure UX stay in lockstep with the inline LeadForm. On a
 * successful POST /api/leads the parent takes over and swaps this modal for
 * the QR download modal — we just reset the form and call onSuccess.
 */
export function TryItModal({ isOpen, onClose, onSuccess }: TryItModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      await api.post('/api/leads', {
        name: data.name.trim(),
        email: data.email.trim(),
      });
      reset({ name: '', email: '' });
      onSuccess();
    } catch (err) {
      setErrorMessage(classifyLeadError(err).message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        className="
          w-full
          modal-md
          bg-white
          p-[24px]
          sm:p-[36px]
          rounded-[24px]
          shadow-xl
          flex
          flex-col
          relative
          font-sans
        "
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="
            absolute
            top-[24px]
            right-[24px]
            text-secondary-900
            hover:text-secondary-600
            active:scale-90
            transition-all
            duration-200
            cursor-pointer
            flex
            items-center
            justify-center
          "
        >
          <Icon name="close" className="text-[24px]" />
        </button>

        <div className="flex flex-col items-center text-center">
          <span className="material-symbols-outlined mb-[12px] text-[48px] text-primary-500">
            rocket_launch
          </span>

          <h2 className="text-[24px] sm:text-[28px] font-bold text-secondary-900 leading-tight mb-[12px]">
            ¡Pruébalo ahora!
          </h2>

          <p className="text-[14px] sm:text-[15px] text-secondary-600 mb-[24px] max-w-[420px]">
            Déjanos tu correo y te enviaremos acceso a la app de AlphaKids para que la pruebes con tu hijo.
          </p>

          {errorMessage && (
            <div className="mb-[20px] w-full max-w-[480px] px-[16px] py-[12px] bg-red-50 text-red-600 rounded-[10px] text-[14px] font-medium">
              {errorMessage}
            </div>
          )}

          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-[480px] flex flex-col gap-[16px]"
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
                  Pruébalo ya
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
